import { useState, useEffect, useCallback } from "react";
import { TestCaseDraft } from "../features/testcases/model";
import { RequirementItem } from "../features/requirements/model";
import { generateDraftTestCases } from "../services/analysis/generateDraftTestCases";
import { projectStore } from "../services/storage/projectStore";

export function useTestCaseReview(projectId?: string) {
  const [testCases, setTestCases] = useState<TestCaseDraft[]>([]);

  // Load initial state
  useEffect(() => {
    if (projectId) {
      const project = projectStore.getProject(projectId);
      if (project) {
        setTestCases(project.testCases || []);
      }
    }
  }, [projectId]);

  // Handle saving
  const saveTestCases = useCallback((updatedTestCases: TestCaseDraft[]) => {
    setTestCases(updatedTestCases);
    if (projectId) {
      projectStore.updateTestCases(projectId, updatedTestCases);
    }
  }, [projectId]);

  function createDrafts(projectIdArg: string, requirements: RequirementItem[]) {
    const id = projectId || projectIdArg;
    const project = projectStore.getProject(id);
    const globalPreconditions = project?.documentMetadata?.preconditions || [];
    const drafts = generateDraftTestCases(id, requirements, globalPreconditions);
    saveTestCases(drafts);
  }

  const approveTestCase = useCallback((id: string) => {
    const updated = testCases.map((tc) => (tc.id === id ? { ...tc, status: "approved" as const } : tc));
    saveTestCases(updated);
  }, [testCases, saveTestCases]);

  const rejectTestCase = useCallback((id: string) => {
    const updated = testCases.map((tc) => (tc.id === id ? { ...tc, status: "rejected" as const } : tc));
    saveTestCases(updated);
  }, [testCases, saveTestCases]);

  const setManualOnly = useCallback((id: string) => {
    const updated = testCases.map((tc) =>
      tc.id === id
        ? { ...tc, status: "manual_only" as const, automationCandidate: false }
        : tc
    );
    saveTestCases(updated);
  }, [testCases, saveTestCases]);

  return {
    testCases,
    createDrafts,
    approveTestCase,
    rejectTestCase,
    setManualOnly,
  };
}
