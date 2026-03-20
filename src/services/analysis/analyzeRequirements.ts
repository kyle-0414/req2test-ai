import { AnalysisSummary } from "../../features/analysis/model";
import { RequirementItem } from "../../features/requirements/model";

export interface AnalyzeRequirementsResult {
  requirements: RequirementItem[];
  summary: AnalysisSummary;
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
  // Heuristic-based extraction for MVP mock phase
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.length > 5);

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

  return { requirements, summary };
}
