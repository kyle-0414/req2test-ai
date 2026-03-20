import { RequirementItem } from "../../features/requirements/model";
import { TestCaseDraft } from "../../features/testcases/model";

export function generateDraftTestCases(
  projectId: string,
  requirements: RequirementItem[]
): TestCaseDraft[] {
  return requirements.map((req, index) => ({
    id: `tc-${String(index + 1).padStart(3, "0")}`,
    projectId,
    linkedRequirementIds: [req.id],
    title: req.normalizedText,
    objective: req.normalizedText,
    preconditions: ["대상 화면에 진입해 있어야 한다."],
    steps: [
      { order: 1, action: "요구사항에 해당하는 동작을 수행한다." },
      { order: 2, action: "화면 상태 변화를 확인한다." },
    ],
    expectedResults: [{ order: 1, description: req.normalizedText }],
    priority: req.priority,
    status: "draft",
    automationCandidate: req.automationCandidate,
    automationSuitability: {
      score: req.automationCandidate ? 85 : 40,
      level: req.automationCandidate ? "high" : "low",
      reasons: req.automationCandidate
        ? ["명확한 UI 결과", "반복 실행 가치가 높음", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`모호함 주의: ${req.ambiguityNotes.join(", ")}`] : [])]
        : ["사람의 해석이 많이 필요함", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`모호함 사유: ${req.ambiguityNotes.join(", ")}`] : [])],
    },
  }));
}
