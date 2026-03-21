import { RequirementItem } from "../../features/requirements/model";
import { AnalyzeRequirementsResult } from "./analyzeRequirements";
import { callLLM } from "../api/llmClient";

interface LLMRequirementOutput {
  id?: string;
  originalText?: string;
  normalizedText?: string; // Korean interpreted scenario
  type?: string; 
  confidence?: "high" | "medium" | "low";
  priority?: "high" | "medium" | "low";
  automationCandidate?: boolean;
  ambiguityNotes?: string[];
  testPoints?: string[]; // Context-specific verification points
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
  const systemPrompt = `You are a Senior QA Engineer and Requirements Strategist.
Your goal is to transform raw, fragmented source text into structured, scenario-level verification units.

### ANALYSIS WORKFLOW:
1. **Understand Global Context**: Identify the core Feature Name, Objective, and Preconditions from the entire text.
2. **Scenario-Based Structuring**: Group related sentences into high-level "Validation Scenarios".
   - DO NOT clone sentences.
   - DO NOT create items for structural labels like [목적], [사전조건], [우선순위].
   - DO NOT treat Preconditions as testable requirements; use them as setup context.
3. **Refine for QA**: For each scenario, generate a clear Korean title, a detailed description, and meaningful Test Points (검증 포인트).

### EXTRACTION RULES:
- **Scenario Title**: Use a concise Korean name ending in "... 검증" (e.g., "버전 정보 화면 진입 검증").
- **Deduplication**: Merge multiple mentions of the same functional behavior into one scenario.
- **Categorization**: Use only these categories:
  - screen_navigation (화면 이동)
  - display (표시)
  - input (입력)
  - exception (예외 처리)
  - state_validation (상태/속성 검증)
  - save (저장)
  - filter (필터)
  - permission (권한)
  - other (기타)
- **Language**: All generated content (normalizedText, ambiguityNotes, testPoints) MUST be in Korean.

### OUTPUT JSON SCHEMA:
{
  "summary": {
    "featureName": "Name of the feature",
    "objective": "Primary goal in Korean",
    "preconditions": ["List of prerequisite states in Korean"]
  },
  "requirements": [
    {
      "originalText": "The relevant snippet(s) from the source",
      "normalizedText": "A clear, Korean scenario-based statement (e.g., '사용자가 Info 아이콘을 클릭했을 때 버전 정보 화면으로 정상 진입하는지 검증')",
      "type": "screen_navigation | display | input | exception | state_validation | save | filter | permission | other",
      "confidence": "high | medium | low",
      "priority": "high | medium | low",
      "automationCandidate": true | false,
      "ambiguityNotes": ["Why is this scenario vague?"],
      "testPoints": ["검증 포인트 1: ...", "검증 포인트 2: ..."]
    }
  ]
}`;

  const userPrompt = `Analyze the following raw text and restructure it into validation scenarios:

=== SOURCE TEXT ===
${text}
=== END TEXT ===
`;

  const rawOutStr = await callLLM({ systemPrompt, userPrompt });
  
  let parsed: LLMAnalysisOutput;
  try {
    parsed = JSON.parse(rawOutStr);
  } catch (error) {
    throw new Error("Failed to parse LLM response as JSON");
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

    // Default title if not provided/formatted correctly
    const titlePrefix = item.normalizedText?.split(' ')[0] || "요구사항";

    return {
      id: `req-llm-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      projectId,
      sourceDocumentId,
      originalText: item.originalText || "Unknown source",
      normalizedText: item.normalizedText || item.originalText || "내용 없음",
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
