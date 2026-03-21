import { ConfidenceLevel, PriorityLevel, RequirementStatus, RequirementType } from "../../types/enums";

export interface RequirementItem {
  id: string;
  projectId: string;
  sourceDocumentId: string;

  originalText: string;
  normalizedText: string;

  type: RequirementType;
  confidence: ConfidenceLevel;
  priority: PriorityLevel;

  status: RequirementStatus;
  automationCandidate: boolean;

  ambiguityNotes: string[];
  selectedTestPoints?: string[];
  preconditions?: string[];
}
