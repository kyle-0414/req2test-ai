import { PriorityLevel } from "../../types/enums";

export interface TestPoint {
  id: string;
  requirementId: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  automationCandidate: boolean;
}

export interface AnalysisSummary {
  totalExtracted: number;
  pendingReview: number;
  autoCandidates: number;
  approvedRequirements: number;
  generatedTestPoints: number;
  generatedTestCases: number;
}
