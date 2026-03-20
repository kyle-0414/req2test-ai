import { SourceDocument } from "../features/documents/model";

export const mockDocuments: SourceDocument[] = [
  {
    id: "doc-001",
    projectId: "project-001",
    fileName: "PRD_v1.2.pdf",
    fileType: "pdf",
    documentType: "requirements_doc",
    uploadedAt: new Date().toISOString(),
    extractedText: "",
    tokens: 2400,
    parseStatus: "idle",
    size: 2400000,
  },
];
