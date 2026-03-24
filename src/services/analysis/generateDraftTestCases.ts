import { RequirementItem } from "../../features/requirements/model";
import { TestCaseDraft, TestStep, ExpectedResult } from "../../features/testcases/model";

function generateStepsForType(req: RequirementItem): TestStep[] {
  const normalized = req.normalizedText;
  
  switch (req.type) {
    case "screen_navigation":
      return [
        { order: 1, action: "필요한 경우 이전 화면에서 진입 점을 식별한다." },
        { order: 2, action: `${normalized}을(를) 위해 해당 버튼 또는 링크를 클릭한다.` },
        { order: 3, action: "화면이 정상적으로 전환되는지 확인한다." },
      ];
    case "display":
      return [
        { order: 1, action: "해당 정보가 노출되는 영역이 포함된 화면으로 진입한다." },
        { order: 2, action: "데이터 로딩이 완료될 때까지 대기한다." },
        { order: 3, action: `화면에 '${normalized}' 내용이 올바르게 표시되는지 육안으로 확인한다.` },
      ];
    case "input":
      return [
        { order: 1, action: "해당 입력 폼이 위치한 화면으로 이동한다." },
        { order: 2, action: "유효한 값을 입력 필드에 입력하거나 항목을 선택한다." },
        { order: 3, action: "정상적으로 처리된 후 입력값에 대한 피드백(텍스트 표시 등)을 확인한다." },
      ];
    case "exception":
      return [
        { order: 1, action: "예외 상황을 유도하기 위한 사전 동작(예: 잘못된 입력, 네트워크 차단 등)을 수행한다." },
        { order: 2, action: "시스템이 의도된 예외 핸들링을 수행하는지 확인한다." },
        { order: 3, action: "사용자에게 안내 문구 또는 팝업이 노출되는지 확인한다." },
      ];
    default:
      return [
        { order: 1, action: "요구사항에 개시된 기능을 수행하기 위한 화면에 진입한다." },
        { order: 2, action: `${normalized}과(와) 관련된 사용자 액션을 수행한다.` },
        { order: 3, action: "시스템의 반응이 기대값과 일치하는지 확인한다." },
      ];
  }
}

export function generateDraftTestCases(
  projectId: string,
  requirements: RequirementItem[],
  globalPreconditions: string[] = []
): TestCaseDraft[] {
  return requirements.map((req, index) => {
    // 1. Title: Use the normalized text
    const title = req.normalizedText;

    // 2. Objective
    const objective = `${req.normalizedText} 시나리오가 시스템 요구사항에 따라 올바르게 동작하는지 확인한다.`;
    
    // 3. Priority: Adjust based on type if unspecified
    let priority = req.priority || "medium";
    if (req.type === "exception") priority = "high";
    if (req.type === "display") priority = "low";

    // Preconditions: Combine global and requirement-specific ones
    const preconditions = [...(req.preconditions || []), ...globalPreconditions];
    if (preconditions.length === 0) {
      preconditions.push("시스템에 정상적으로 접근 가능한 상태여야 한다.");
    }

    // 4. Steps & Expected Results: Derived from AI Test Points
    const steps: TestStep[] = [];
    const expectedResults: ExpectedResult[] = [];

    if (req.selectedTestPoints && req.selectedTestPoints.length > 0) {
      // Use test points as steps/expected results
      req.selectedTestPoints.forEach((point, i) => {
        steps.push({ 
          order: i + 1, 
          action: `${point} 항목에 대한 조작 또는 상태를 확인한다.` 
        });
        
        let resultDesc = `${point} 결과값이 기대사항과 일치해야 한다.`;
        if (req.type === 'exception') resultDesc = `해당 조건 부합 시 ${point} 에러 메시지 또는 예외 처리가 정상적으로 수행되어야 한다.`;
        if (req.type === 'display') resultDesc = `화면상에 ${point} 정보가 위치에 맞게 정확히 표시되어야 한다.`;
        if (req.type === 'screen_navigation') resultDesc = `해당 동작 후 ${point} 화면으로 정상 전환되어야 한다.`;

        expectedResults.push({ 
          order: i + 1, 
          description: resultDesc
        });
      });
    } else {
      // Generic fallback based on type
      steps.push({ order: 1, action: "대상 화면 또는 기능에 접근한다." });
      steps.push({ order: 2, action: `${req.normalizedText}와 관련된 사용자 동작을 수행한다.` });
      
      expectedResults.push({ 
        order: 1, 
        description: req.type === 'exception' 
            ? `${req.normalizedText} 상황에 대응하는 에러 핸들링이 발생해야 한다.`
            : `${req.normalizedText} 요구사항이 화면에 올바르게 적용되어 정상 동작해야 한다.`
      });
    }

    return {
      id: `tc-draft-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      projectId,
      linkedRequirementIds: [req.id],
      title,
      objective,
      preconditions,
      steps,
      expectedResults,
      priority,
      status: "draft",
      automationCandidate: req.automationCandidate,
      automationSuitability: {
        score: req.automationCandidate ? (req.confidence === 'high' ? 90 : 75) : 35,
        level: req.automationCandidate ? "high" : "low",
        reasons: req.automationCandidate
          ? ["안정적인 UI 감지 가능", "핵심 시나리오", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`주의: ${req.ambiguityNotes[0]}`] : [])]
          : ["사람의 주관적 판단 필요", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`모호성: ${req.ambiguityNotes[0]}`] : [])],
      },
    };
  });
}
