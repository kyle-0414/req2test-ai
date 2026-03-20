import { RequirementItem } from "../features/requirements/model";

export const mockRequirements: RequirementItem[] = [
  {
    id: "req-001",
    projectId: "project-001",
    sourceDocumentId: "doc-001",
    originalText: "우상단 Info 아이콘을 클릭하면 SW 버전 표시 화면으로 이동된다.",
    normalizedText: "우상단 Info 아이콘 클릭 시 SW 버전 화면으로 이동해야 한다.",
    type: "screen_navigation",
    confidence: "high",
    priority: "high",
    status: "approved",
    automationCandidate: true,
    ambiguityNotes: [],
    extractedFrom: { page: 1, section: "Info", lineStart: 3, lineEnd: 3 },
  },
];
