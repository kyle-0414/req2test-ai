import { useState, useEffect, useCallback } from "react";
import { AnalysisFlowState } from "../types/enums";
import { RequirementItem } from "../features/requirements/model";
import { AnalysisSummary, TestPoint } from "../features/analysis/model";
import { analyzeRequirements } from "../services/analysis/analyzeRequirements";
import { generateTestPoints } from "../services/analysis/generateTestPoints";
import { projectStore } from "../services/storage/projectStore";

export function useAnalysisFlow(projectId?: string) {
  const [state, setState] = useState<AnalysisFlowState>("idle");
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [testPoints, setTestPoints] = useState<TestPoint[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);

  // Load initial state
  useEffect(() => {
    if (projectId) {
      const project = projectStore.getProject(projectId);
      if (project) {
        setRequirements(project.requirements || []);
        setTestPoints(generateTestPoints(project.requirements || []));
        setSummary(project.analysisSummary || null);
        if (project.requirements && project.requirements.length > 0) {
          setState("analyzed");
        }
      }
    }
  }, [projectId]);

  async function runAnalysis(
    projectIdArg: string,
    sourceDocumentId: string,
    text: string
  ) {
    setState("analyzing");
    const id = projectId || projectIdArg;
    const result = await analyzeRequirements(id, sourceDocumentId, text);
    
    setRequirements(result.requirements);
    setTestPoints(generateTestPoints(result.requirements));
    setSummary(result.summary);
    setState("analyzed");

    if (id) {
      projectStore.updateRequirements(id, result.requirements);
      projectStore.updateAnalysisSummary(id, result.summary);
      if (result.documentMetadata) {
        projectStore.updateDocumentMetadata(id, result.documentMetadata);
      }
    }
  }

  const updateRequirement = useCallback((updatedReq: RequirementItem) => {
    const updatedReqs = requirements.map(r => r.id === updatedReq.id ? updatedReq : r);
    setRequirements(updatedReqs);
    if (projectId) {
      projectStore.updateRequirements(projectId, updatedReqs);
    }
  }, [requirements, projectId]);

  return {
    state,
    requirements,
    testPoints,
    summary,
    runAnalysis,
    updateRequirement,
  };
}
