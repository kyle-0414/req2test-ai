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
Your task is to analyze raw source text and extract high-quality software requirements.

### Extraction Rules:
1. **Focus on Scenarios**: Extract requirements at a validation scenario level, not just raw sentence cloning.
2. **Deduplicate**: If multiple sentences describe the same functional requirement (e.g., "Login button clicks" and "User can login"), merge them into a single coherent requirement.
3. **Exclude Structural Junk**: Do not extract document section labels (like [사전조건], [목적], [우선순위]) as requirements.
4. **Normalize**: Convert vague or informal text into professional, actionable requirement language.
5. **Categorize**: Accurately assign types (screen_navigation, display, input, exception, etc.).
6. **Ambiguity Detection**: If a sentence is vague (e.g., "if needed", "considerable"), set confidence to 'low' and add specific 'ambiguityNotes'.

### Output Schema:
Output ONLY a JSON object:
{
  "requirements": [
    {
      "originalText": "The relevant snippet from the source",
      "normalizedText": "A clear, scenario-based requirement statement",
      "type": "screen_navigation | display | input | exception | popup | filter | permission | save | other",
      "confidence": "high | medium | low",
      "priority": "high | medium | low",
      "automationCandidate": true | false,
      "ambiguityNotes": ["Why is it ambiguous? What is missing?"]
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
