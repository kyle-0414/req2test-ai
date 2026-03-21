import { AnalysisSummary } from "../../features/analysis/model";
import { RequirementItem } from "../../features/requirements/model";
import { analyzeRequirementsWithLLM } from "./analyzeRequirementsWithLLM";
import { preprocessDocument } from "./documentPreprocessor";

export interface AnalyzeRequirementsResult {
  requirements: RequirementItem[];
  summary: AnalysisSummary;
  documentMetadata?: {
    preconditions: string[];
    objectives: string[];
    priorities: string[];
  };
}

function inferType(text: string): RequirementItem["type"] {
  if (text.includes("이동")) return "screen_navigation";
  if (text.includes("표시") || text.includes("노출")) return "display";
  if (text.includes("필터")) return "filter";
  if (text.includes("입력")) return "input";
  return "other";
}

function inferConfidence(text: string): RequirementItem["confidence"] {
  const hasCondition = /경우|시|하면/.test(text);
  const hasExpected = /표시|노출|이동|비활성|갱신/.test(text);
  if (hasCondition && hasExpected) return "high";
  if (hasCondition || hasExpected) return "medium";
  return "low";
}

function inferPriority(text: string): RequirementItem["priority"] {
  if (/로그인|저장|버전|필수|네트워크/.test(text)) return "high";
  if (/필터|팝업/.test(text)) return "medium";
  return "low";
}

export async function analyzeRequirements(
  projectId: string,
  sourceDocumentId: string,
  text: string
): Promise<AnalyzeRequirementsResult> {
  // 0. Preprocess the document for structure
  const { sections, metadata, cleanedText } = preprocessDocument(text);
  console.log(`[analyzeRequirements] Preprocessed document: found ${sections.length} sections.`);

  // 1. Try LLM path first
  try {
    console.log("[analyzeRequirements] Attempting LLM-based requirement analysis...");
    const result = await analyzeRequirementsWithLLM(projectId, sourceDocumentId, cleanedText);
    console.log("[analyzeRequirements] LLM-based analysis succeeded.");
    
    // Enrich with metadata
    return {
      ...result,
      documentMetadata: metadata,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.warn("[analyzeRequirements] LLM analysis failed, falling back to heuristic:", error.message);
    } else {
      console.warn("[analyzeRequirements] LLM analysis failed, falling back to heuristic:", error);
    }
  }

  // 2. Fallback to heuristic-based extraction
  // Even in fallback, we should leverage cleanedText or filtered lines
  const lines = cleanedText
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    // More strict filtering: must be at least 5 meaningful characters AND NOT just structural labels
    .filter((line) => line.length >= 6 && !/^\[?.*(목적|사전조건|우선순위|요구사항).*\]?$/.test(line));

  const requirements: RequirementItem[] = lines.map((line, index) => {
    const confidence = inferConfidence(line);
    return {
      id: `req-${String(index + 1).padStart(3, "0")}`,
      projectId,
      sourceDocumentId,
      originalText: line,
      normalizedText: line,
      type: inferType(line),
      confidence,
      priority: inferPriority(line),
      status: confidence === "low" ? "review_needed" : "approved",
      automationCandidate: /클릭|표시|이동|필터|버튼|비활성/.test(line),
      ambiguityNotes:
        confidence === "low" ? ["기대결과 또는 조건 표현이 모호함"] : [],
    };
  });

  const summary: AnalysisSummary = {
    totalExtracted: requirements.length,
    pendingReview: requirements.filter((r) => r.status === "review_needed").length,
    autoCandidates: requirements.filter((r) => r.automationCandidate).length,
    approvedRequirements: requirements.filter((r) => r.status === "approved").length,
    generatedTestPoints: requirements.length,
    generatedTestCases: requirements.length,
  };

  return { 
    requirements, 
    summary,
    documentMetadata: metadata,
  };
}
