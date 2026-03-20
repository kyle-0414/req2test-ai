import { RequirementItem } from "../../features/requirements/model";
import { AnalyzeRequirementsResult } from "./analyzeRequirements";
import { callLLM } from "../api/llmClient";

interface LLMRequirementOutput {
  originalText?: string;
  normalizedText?: string;
  type?: string;
  confidence?: string;
  priority?: string;
  automationCandidate?: boolean;
  ambiguityNotes?: string[];
}

interface LLMAnalysisOutput {
  requirements: LLMRequirementOutput[];
}

export async function analyzeRequirementsWithLLM(
  projectId: string,
  sourceDocumentId: string,
  text: string
): Promise<AnalyzeRequirementsResult> {
  const systemPrompt = `You are an expert QA Analyst and Requirements Engineer.
Your task is to analyze the provided raw source text (which may have formatting issues, OCR errors, or incomplete sentences) and extract software requirements.

Perform the following:
1. Extract distinct, actionable requirement items.
2. Normalize the requirement text to clear, professional language.
3. Classify its type.
4. Estimate confidence (clarity) and priority (business/technical impact).
5. Identify any ambiguities or missing conditions.
6. Determine if it is a suitable candidate for test automation.

Output ONLY a JSON object with the following structure. No markdown wrappers or additional text:
{
  "requirements": [
    {
      "originalText": "The exact source text chunk corresponding to this requirement",
      "normalizedText": "A clear, actionable normalized version of the requirement",
      "type": "Must be exactly one of: screen_navigation, display, input, exception, popup, filter, permission, save, other",
      "confidence": "Must be exactly one of: high, medium, low",
      "priority": "Must be exactly one of: high, medium, low",
      "automationCandidate": true or false,
      "ambiguityNotes": ["Any notes about missing conditions, vague terms, etc. Return empty array if completely clear."]
    }
  ]
}`;

  const userPrompt = `Please analyze the following raw text and extract requirements according to the schema:

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

    let rType = item.type?.toLowerCase() as RequirementItem["type"];
    const validTypes = ["screen_navigation", "display", "input", "exception", "popup", "filter", "permission", "save", "other"];
    if (!validTypes.includes(rType)) {
      rType = "other";
    }

    return {
      id: `req-llm-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      projectId,
      sourceDocumentId,
      originalText: item.originalText || "Unknown source",
      normalizedText: item.normalizedText || item.originalText || "Unknown requirement",
      type: rType,
      confidence,
      priority,
      status: confidence === "low" ? "review_needed" : "approved",
      automationCandidate: !!item.automationCandidate,
      ambiguityNotes: Array.isArray(item.ambiguityNotes) ? item.ambiguityNotes : [],
    };
  });

  const summary = {
    totalExtracted: requirements.length,
    pendingReview: requirements.filter((r) => r.status === "review_needed").length,
    autoCandidates: requirements.filter((r) => r.automationCandidate).length,
    approvedRequirements: requirements.filter((r) => r.status === "approved").length,
    generatedTestPoints: requirements.length, // Placeholder mapping downstream
    generatedTestCases: requirements.length, // Placeholder mapping downstream
  };

  return { requirements, summary };
}
