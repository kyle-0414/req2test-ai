import { useState, useEffect, useCallback } from "react";
import { TestCaseDraft } from "../features/testcases/model";
import { RequirementItem } from "../features/requirements/model";
import { generateDraftTestCases } from "../services/analysis/generateDraftTestCases";
import { generateDraftTestCasesWithLLM } from "../services/analysis/generateDraftTestCasesWithLLM";
import { projectStore } from "../services/storage/projectStore";

export function useTestCaseReview(projectId?: string) {
  const [testCases, setTestCases] = useState<TestCaseDraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

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

  async function createDrafts(projectIdArg: string, requirements: RequirementItem[]) {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const id = projectId || projectIdArg;
      const project = projectStore.getProject(id);
      const globalPreconditions = project?.documentMetadata?.preconditions || [];
      
      let drafts: TestCaseDraft[];
      try {
        drafts = await generateDraftTestCasesWithLLM(id, requirements, globalPreconditions);
      } catch (err) {
        console.warn("LLM TC Generation failed. Falling back to heuristic.", err);
        drafts = generateDraftTestCases(id, requirements, globalPreconditions);
      }
      
      saveTestCases(drafts);
    } catch (err) {
      console.error(err);
      setGenerationError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
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
    isGenerating,
    generationError,
    createDrafts,
    approveTestCase,
    rejectTestCase,
    setManualOnly,
  };
}

