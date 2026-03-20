import { useState, useCallback } from "react";
import { SourceDocument } from "../features/documents/model";
import { UploadFlowState } from "../types/enums";
import { mockDocuments } from "../mocks/documents";
import { parseImageOcr } from "../services/document/parseImageOcr";

export function useUploadFlow() {
  const [documents, setDocuments] = useState<SourceDocument[]>(mockDocuments);
  const [state, setState] = useState<UploadFlowState>("idle");

  const addDocument = useCallback(async (doc: SourceDocument, file?: File | Blob) => {
    const isImage = doc.fileType === 'png' || doc.fileType === 'jpg' || doc.previewUrl != null;

    if (isImage) {
      doc.parseStatus = 'parsing';
    } else {
      doc.parseStatus = 'parsed';
    }

    setDocuments((prev) => [...prev, doc]);

    if (isImage) {
      try {
        const imageSource = file || doc.previewUrl;
        if (!imageSource) {
          throw new Error("No image source available for OCR.");
        }
        
        const result = await parseImageOcr(imageSource);
        
        setDocuments((prev) => 
          prev.map((d) => 
            d.id === doc.id 
              ? {
                  ...d,
                  parseStatus: 'parsed',
                  ocrText: result.ocrText,
                  extractedText: result.extractedText,
                  tokens: result.tokens
                }
              : d
          )
        );
      } catch (err: any) {
        console.error("Error in OCR:", err);
        setDocuments((prev) => 
          prev.map((d) => 
            d.id === doc.id 
              ? {
                  ...d,
                  parseStatus: 'failed',
                  parseError: err.message || "OCR failed"
                }
              : d
          )
        );
      }
    }
  }, []);

  return {
    documents,
    state,
    setState,
    addDocument,
  };
}
