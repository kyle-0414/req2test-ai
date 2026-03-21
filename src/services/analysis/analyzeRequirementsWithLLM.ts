import { RequirementItem } from "../../features/requirements/model";
import { AnalyzeRequirementsResult } from "./analyzeRequirements";
import { callLLM } from "../api/llmClient";

interface LLMRequirementOutput {
  sourceClaim?: string;    // Minimal quote from source spec (replaces originalText)
  originalText?: string;   // Kept for backward compat
  normalizedText?: string; // Independently written QA verification statement
  type?: string; 
  confidence?: "high" | "medium" | "low";
  priority?: "high" | "medium" | "low";
  automationCandidate?: boolean;
  ambiguityNotes?: string[];
  testPoints?: string[];
}

interface LLMAnalysisOutput {
  summary: {
    featureName: string;
    objective: string;
    preconditions: string[];
  };
  requirements: LLMRequirementOutput[];
}

export async function analyzeRequirementsWithLLM(
  projectId: string,
  sourceDocumentId: string,
  text: string
): Promise<AnalyzeRequirementsResult> {
  const systemPrompt = `You are a Senior QA Engineer with 10+ years of experience turning product specifications into rigorous, executable test requirements.

Your task is NOT to reformat or classify the input text.
Your task is to READ the specification as a QA expert and DERIVE a complete set of verification requirements — including ones that are implied, inferred, or missing from the original text.

### MINDSET:
Think like a QA engineer who must guarantee this feature works correctly in production.
Ask yourself: "What MUST be true for this feature to be considered working correctly?"
Go beyond what is explicitly written. Surface hidden behaviors, edge cases, and implicit business rules.

### DERIVATION RULES:
1. **Independence**: Each requirement must be a self-contained, testable QA statement — NOT a copy or paraphrase of the source text.
2. **New Language**: Write normalizedText in your own words as a QA professional. Never copy-paste from the source.
3. **Coverage**: Derive requirements for ALL of the following where applicable:
   - Happy path (정상 흐름)
   - Edge cases and boundary conditions (경계값, 극단 케이스)
   - Error/exception handling (오류 처리)
   - State transitions (상태 변화)
   - Data persistence (데이터 저장 / 유지)
   - Permission and access control (권한)
   - UI rendering accuracy (화면 표시 정확성)
4. **No Duplication**: Do not create two requirements for the same verification point.
5. **sourceClaim**: In the "sourceClaim" field, record the minimal relevant quote from the source text that justifies this requirement (1-2 sentences max). Leave empty string if it is an inferred requirement with no direct source sentence.

### OUTPUT JSON SCHEMA:
{
  "summary": {
    "featureName": "Feature name in Korean",
    "objective": "Primary QA objective — what must be guaranteed for this feature",
    "preconditions": ["Prerequisites or initial state assumptions in Korean"]
  },
  "requirements": [
    {
      "sourceClaim": "Minimal quote from the source spec this is based on (empty string if inferred)",
      "normalizedText": "A clear, QA-authored Korean verification statement written independently. E.g. '사용자가 Info 아이콘을 클릭하면 버전 정보 화면으로 정상 진입해야 한다'",
      "type": "screen_navigation | display | input | exception | state_validation | save | filter | permission | other",
      "confidence": "high | medium | low",
      "priority": "high | medium | low",
      "automationCandidate": true | false,
      "ambiguityNotes": ["Uncertainty or ambiguity that needs clarification from PM/Dev"],
      "testPoints": ["검증 포인트 1: 구체적인 검증 기준", "검증 포인트 2: ..."]
    }
  ]
}

### LANGUAGE RULE:
All output fields (normalizedText, ambiguityNotes, testPoints, summary fields) MUST be written in Korean.
sourceClaim must be a direct quote from the input text — keep the original language of the source.`;

  const userPrompt = `Read the following product specification. As a Senior QA Engineer, derive a comprehensive set of verification requirements that would guarantee this feature works correctly.

Do NOT copy the source text into normalizedText. Write each requirement as an independent QA statement in your own words.

=== PRODUCT SPECIFICATION ===
${text}
=== END SPECIFICATION ===

Now derive the verification requirements:`;

  const rawOutStr = await callLLM({ systemPrompt, userPrompt });
  
  let parsed: LLMAnalysisOutput;
  try {
    // Find the first '{' and last '}' to handle potential conversational prefix/suffix
    const firstBrace = rawOutStr.indexOf('{');
    const lastBrace = rawOutStr.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }
    const cleanStr = rawOutStr.substring(firstBrace, lastBrace + 1);
    parsed = JSON.parse(cleanStr);
  } catch (error) {
    throw new Error("Failed to parse LLM response as JSON: " + rawOutStr);
  }

  if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
    throw new Error("LLM response did not contain a valid requirements array");
  }

  const requirements: RequirementItem[] = parsed.requirements.map((item, index) => {
    const rawConfidence = item.confidence?.toLowerCase() as RequirementItem["confidence"];
    const confidence = ["high", "medium", "low"].includes(rawConfidence) ? rawConfidence : "low";

    const rawPriority = item.priority?.toLowerCase() as RequirementItem["priority"];
    const priority = ["high", "medium", "low"].includes(rawPriority) ? rawPriority : "low";

    let rType = (item.type || "other").toLowerCase() as RequirementItem["type"];
    const validTypes = ["screen_navigation", "display", "input", "exception", "state_validation", "save", "filter", "permission", "other"];
    if (!validTypes.includes(rType)) {
      rType = "other";
    }

    // sourceClaim is the minimal source quote kept for traceability
    const sourceClaim = item.sourceClaim ?? item.originalText ?? "";

    return {
      id: `req-llm-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      projectId,
      sourceDocumentId,
      originalText: sourceClaim,
      normalizedText: item.normalizedText || "내용 없음",
      type: rType,
      confidence,
      priority,
      status: confidence === "low" ? "review_needed" : "approved",
      automationCandidate: !!item.automationCandidate,
      ambiguityNotes: Array.isArray(item.ambiguityNotes) ? item.ambiguityNotes : [],
      selectedTestPoints: Array.isArray(item.testPoints) ? item.testPoints : [],
      preconditions: Array.isArray(parsed.summary.preconditions) ? parsed.summary.preconditions : []
    };
  });

  const summary = {
    totalExtracted: requirements.length,
    pendingReview: requirements.filter((r) => r.status === "review_needed").length,
    autoCandidates: requirements.filter((r) => r.automationCandidate).length,
    approvedRequirements: requirements.filter((r) => r.status === "approved").length,
    generatedTestPoints: requirements.reduce((acc, r) => acc + (r.selectedTestPoints?.length || 0), 0),
    generatedTestCases: requirements.length,
  };

  return { requirements, summary };
}
