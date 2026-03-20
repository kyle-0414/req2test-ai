import { useState, useCallback, useEffect } from "react";
import { SourceDocument } from "../features/documents/model";
import { UploadFlowState } from "../types/enums";
import { parseImageOcr } from "../services/document/parseImageOcr";
import { projectStore } from "../services/storage/projectStore";

export function useUploadFlow(projectId?: string) {
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [state, setState] = useState<UploadFlowState>("idle");

  // Load initial state
  useEffect(() => {
    if (projectId) {
      const project = projectStore.getProject(projectId);
      if (project) {
        setDocuments(project.documents || []);
      }
    }
  }, [projectId]);

  // Persistence side effect
  const saveDocuments = useCallback((newDocs: SourceDocument[]) => {
    setDocuments(newDocs);
    if (projectId) {
      projectStore.updateDocuments(projectId, newDocs);
    }
  }, [projectId]);

  const addDocument = useCallback(async (doc: SourceDocument, file?: File | Blob) => {
    const isImage = doc.fileType === 'png' || doc.fileType === 'jpg' || doc.previewUrl != null;

    if (isImage) {
      doc.parseStatus = 'parsing';
    } else {
      doc.parseStatus = 'parsed';
    }

    const updatedDocsBeforeOCR = [...documents, doc];
    saveDocuments(updatedDocsBeforeOCR);

    if (isImage) {
      try {
        const imageSource = file || doc.previewUrl;
        if (!imageSource) {
          throw new Error("No image source available for OCR.");
        }
        
        const result = await parseImageOcr(imageSource);
        
        const updatedDocsAfterOCR = updatedDocsBeforeOCR.map((d) => 
          d.id === doc.id 
            ? {
                ...d,
                parseStatus: 'parsed' as const,
                ocrText: result.ocrText,
                extractedText: result.extractedText,
                tokens: result.tokens
              }
            : d
        );
        saveDocuments(updatedDocsAfterOCR);
      } catch (err: any) {
        console.error("Error in OCR:", err);
        const updatedDocsFailed = updatedDocsBeforeOCR.map((d) => 
          d.id === doc.id 
            ? {
                ...d,
                parseStatus: 'failed' as const,
                parseError: err.message || "OCR failed"
              }
            : d
        );
        saveDocuments(updatedDocsFailed);
      }
    }
  }, [documents, saveDocuments]);

  const removeDocument = useCallback((docId: string) => {
    const updatedDocs = documents.filter(d => d.id !== docId);
    saveDocuments(updatedDocs);
  }, [documents, saveDocuments]);

  return {
    documents,
    state,
    setState,
    addDocument,
    removeDocument,
  };
}
