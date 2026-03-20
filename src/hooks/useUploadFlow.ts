import { useState } from "react";
import { SourceDocument } from "../features/documents/model";
import { UploadFlowState } from "../types/enums";
import { mockDocuments } from "../mocks/documents";

export function useUploadFlow() {
  const [documents, setDocuments] = useState<SourceDocument[]>(mockDocuments);
  const [state, setState] = useState<UploadFlowState>("idle");

  function addDocument(doc: SourceDocument) {
    setDocuments((prev) => [...prev, doc]);
  }

  return {
    documents,
    state,
    setState,
    addDocument,
  };
}
