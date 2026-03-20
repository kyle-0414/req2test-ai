import { useState } from "react";
import { TestCaseDraft } from "../features/testcases/model";
import { RequirementItem } from "../features/requirements/model";
import { generateDraftTestCases } from "../services/analysis/generateDraftTestCases";

export function useTestCaseReview() {
  const [testCases, setTestCases] = useState<TestCaseDraft[]>([]);

  function createDrafts(projectId: string, requirements: RequirementItem[]) {
    const drafts = generateDraftTestCases(projectId, requirements);
    setTestCases(drafts);
  }

  function approveTestCase(id: string) {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, status: "approved" } : tc))
    );
  }

  function rejectTestCase(id: string) {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, status: "rejected" } : tc))
    );
  }

  function setManualOnly(id: string) {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === id
          ? { ...tc, status: "manual_only", automationCandidate: false }
          : tc
      )
    );
  }

  return {
    testCases,
    createDrafts,
    approveTestCase,
    rejectTestCase,
    setManualOnly,
  };
}
