import { DocumentType, SourceFileType } from "../../types/enums";

export interface SourceDocument {
  id: string;
  projectId: string;
  fileName: string;
  fileType: SourceFileType;
  documentType: DocumentType;
  uploadedAt: string;

  extractedText?: string;
  ocrText?: string;

  previewUrl?: string;
  size?: number;
  tokens?: number;

  parseStatus: "idle" | "parsing" | "parsed" | "failed";
  parseError?: string;
}
