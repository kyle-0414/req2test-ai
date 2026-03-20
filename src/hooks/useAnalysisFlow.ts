import { useState } from "react";
import { AnalysisFlowState } from "../types/enums";
import { RequirementItem } from "../features/requirements/model";
import { AnalysisSummary, TestPoint } from "../features/analysis/model";
import { analyzeRequirements } from "../services/analysis/analyzeRequirements";
import { generateTestPoints } from "../services/analysis/generateTestPoints";

export function useAnalysisFlow() {
  const [state, setState] = useState<AnalysisFlowState>("idle");
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [testPoints, setTestPoints] = useState<TestPoint[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);

  async function runAnalysis(
    projectId: string,
    sourceDocumentId: string,
    text: string
  ) {
    setState("analyzing");
    const result = await analyzeRequirements(projectId, sourceDocumentId, text);
    setRequirements(result.requirements);
    setTestPoints(generateTestPoints(result.requirements));
    setSummary(result.summary);
    setState("analyzed");
  }

  return {
    state,
    requirements,
    testPoints,
    summary,
    runAnalysis,
  };
}
