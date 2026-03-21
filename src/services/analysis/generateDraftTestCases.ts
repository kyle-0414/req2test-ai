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
  // Group similar requirements in the future, for now focus on per-requirement quality
  return requirements.map((req, index) => {
    // Generate a short scenario title
    let title = req.normalizedText;
    if (title.length > 25) {
      title = `${req.type === 'exception' ? '[예외] ' : ''}${req.normalizedText.substring(0, 20)}...`;
    }
    
    // Better title based on type
    if (req.type === "screen_navigation") title = `${req.normalizedText} 화면 진입 확인`;
    else if (req.type === "display") title = `${req.normalizedText} 정보 노출 확인`;
    else if (req.type === "exception") title = `${req.normalizedText} 대응 확인`;

    const objective = `구사항 '${req.normalizedText}'이(가) 시스템에서 올바르게 설계 및 구현되었는지 검증한다.`;
    
    const preconditions = [...globalPreconditions];
    if (preconditions.length === 0) {
      preconditions.push("대상 화면에 진입 및 로그인 상태여야 한다.");
    }

    const steps = generateStepsForType(req);
    const expectedResults: ExpectedResult[] = [
      { order: 1, description: `${req.normalizedText} 요구사항이 화면에 올바르게 적용되어야 한다.` }
    ];

    if (req.type === "screen_navigation") {
      expectedResults[0].description = "목표한 화면으로 정상적으로 이동되어야 한다.";
    } else if (req.type === "exception") {
      expectedResults[0].description = "시스템 오류 없이 안내 메시지가 정상 노출되어야 한다.";
    }

    return {
      id: `tc-${String(index + 1).padStart(3, "0")}`,
      projectId,
      linkedRequirementIds: [req.id],
      title,
      objective,
      preconditions,
      steps,
      expectedResults,
      priority: req.priority,
      status: "draft",
      automationCandidate: req.automationCandidate,
      automationSuitability: {
        score: req.automationCandidate ? (req.confidence === 'high' ? 90 : 75) : 40,
        level: req.automationCandidate ? "high" : "low",
        reasons: req.automationCandidate
          ? ["구조화된 UI 요소", "반복 실행 가치가 높음", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`주의: ${req.ambiguityNotes[0]}`] : [])]
          : ["사람의 판단이나 복잡한 환경 설정 필요", ...(req.ambiguityNotes && req.ambiguityNotes.length > 0 ? [`모호함: ${req.ambiguityNotes[0]}`] : [])],
      },
    };
  });
}
