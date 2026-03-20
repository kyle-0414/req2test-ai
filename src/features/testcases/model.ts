import { PriorityLevel, TestCaseStatus } from "../../types/enums";

export interface TestStep {
  order: number;
  action: string;
}

export interface ExpectedResult {
  order: number;
  description: string;
}

export interface AutomationSuitability {
  score: number;
  level: "high" | "medium" | "low";
  reasons: string[];
}

export interface TestCaseDraft {
  id: string;
  projectId: string;
  linkedRequirementIds: string[];

  title: string;
  objective: string;
  preconditions: string[];

  steps: TestStep[];
  expectedResults: ExpectedResult[];

  priority: PriorityLevel;
  status: TestCaseStatus;
  automationCandidate: boolean;

  automationSuitability?: AutomationSuitability;
  reviewComment?: string;
}
