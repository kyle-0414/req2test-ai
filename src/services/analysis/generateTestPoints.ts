import { TestPoint } from "../../features/analysis/model";
import { RequirementItem } from "../../features/requirements/model";

export function generateTestPoints(requirements: RequirementItem[]): TestPoint[] {
  return requirements.map((req, index) => ({
    id: `tp-${String(index + 1).padStart(3, "0")}`,
    requirementId: req.id,
    title: `${req.type} 검증`,
    description: req.normalizedText,
    priority: req.priority,
    automationCandidate: req.automationCandidate,
  }));
}
