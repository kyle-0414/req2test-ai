import { RequirementItem } from "../../features/requirements/model";
import { TestCaseDraft, TestStep, ExpectedResult } from "../../features/testcases/model";
import { callLLM } from "../api/llmClient";

interface LLMScenario {
  scenarioTitle: string;
  scenarioGoal: string;
  preconditions: string[];
  userActions: string[];
  verificationPoints: string[];
  exceptionPath?: string;
  automationRecommended: boolean;
  priority: "high" | "medium" | "low";
  relatedRequirementIds: string[];
}

interface LLMTCResponse {
  scenarios: LLMScenario[];
}

export async function generateDraftTestCasesWithLLM(
  projectId: string,
  requirements: RequirementItem[],
  globalPreconditions: string[] = []
): Promise<TestCaseDraft[]> {
  const reqStr = JSON.stringify(
    requirements.map(r => ({
      id: r.id,
      text: r.normalizedText,
      type: r.type,
      tags: r.ambiguityNotes
    })),
    null,
    2
  );

  const systemPrompt = `You are a Senior QA Automation Expert.
Your task is to review a raw list of requirements and restructure them into a set of "Validation Scenarios" for creating High-Quality Test Cases.

[핵심 목표]
requirement를 그대로 문장 변환하는 것이 아니라, QA 검증 시나리오 단위로 재구성한 뒤 사람이 바로 검토 가능한 수준의 TC 초안을 생성하는 것입니다.

[해야 할 것 (MUST DO)]:
1. 테스트케이스 1개는 하나의 핵심 검증 목적만 가지도록 생성하세요.
2. 필요 시 다음 기준으로 시나리오를 분리하세요: 화면 진입 / 화면 내 표시 및 상태 / 뒤로가기 및 복귀 / 예외 처리 및 비활성 상태.
3. 테스트 단계(userActions)에 포함된 모든 검증 행위는 기대결과(verificationPoints)에서 누락 없이 1:1로 설명되어야 합니다.
4. 정상 케이스(Happy Path)와 예외 케이스(Exception)를 명확히 분리하세요.
5. 제목(scenarioTitle)은 구체적인 행동 중심으로 생성하세요. (~검증, ~확인, ~동작 확인)
6. 중요도(priority)는 다음 기준으로 설정하세요:
   - High: 핵심 비즈니스 로직, 기능 차단 오류 가능성 있는 경우 (로그인, 결제, 데이터 저장 등)
   - Medium: 보조 기능, 일반적인 데이터 정합성 확인
   - Low: 단순 UI 스타일, 오타, 안내 문구 표기 등

[하지 말아야 할 것 (MUST NOT DO)]:
1. 여러 검증 목적을 하나의 TC에 과도하게 묶지 마세요.
2. **동일한 기대결과(verificationPoints)를 다른 시나리오에서 반복하지 마세요.** 
   - 각 시나리오는 해당 동작의 결과인 전용 기대결과를 가져야 합니다. (예: 예외 처리 시나리오는 단순히 '화면 표시'가 아니라 '구체적인 에러 메시지 노출'을 기대결과로 작성)
3. "기능 검증", "전체 확인" 같은 포괄적이고 모호한 제목 사용을 절대 금지합니다.
4. requirement 1개를 그대로 TC 1개로 단순 변환하지 마세요. (연관된 것은 적절히 병합)
5. **모든 TC의 중요도를 "high"로 일괄 설정하지 마세요.** 위험도와 빈도에 따라 적절히 분산하세요.

필드 작성 가이드:
- scenarioTitle: 구체적인 동작 명시 (예: 비밀번호 5회 오류 시 계정 잠금 팝업 노출 검증)
- scenarioGoal: 이 TC가 실제 비즈니스 가치 측면에서 무엇을 검증하는지 작성.
- verificationPoints: 화면 이동, 문구/값 표시, 비활성 상태 등 **시나리오와 직접 연결된 구체적이고 명확한** 기대결과 작성.

출력은 반드시 규격에 맞는 JSON 배열이어야 합니다.

### OUTPUT JSON SCHEMA:
{
  "scenarios": [
    {
       "scenarioTitle": "...",
       "scenarioGoal": "...",
       "preconditions": ["...", "..."],
       "userActions": ["...", "..."],
       "verificationPoints": ["...", "..."],
       "exceptionPath": "...",
       "automationRecommended": true,
       "priority": "high",
       "relatedRequirementIds": ["..."]
    }
  ]
}
`;

  const userPrompt = `다음 요구사항 목록을 분석하여 Validation Scenario 기반의 TC 데이터로 변환해 주세요.\n\n=== 원본 요구사항 ===\n${reqStr}\n=== 종료 ===\n`;

  const rawOutStr = await callLLM({ systemPrompt, userPrompt });

  let parsed: LLMTCResponse;
  try {
    const firstBrace = rawOutStr.indexOf('{');
    const lastBrace = rawOutStr.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found");
    }
    const cleanStr = rawOutStr.substring(firstBrace, lastBrace + 1);
    parsed = JSON.parse(cleanStr);
  } catch (error) {
    throw new Error("Failed to parse LLM TC response: " + rawOutStr);
  }

  if (!parsed.scenarios || !Array.isArray(parsed.scenarios)) {
    throw new Error("Invalid schema: missing scenarios array.");
  }

  return parsed.scenarios.map((scenario, index) => {
    const steps: TestStep[] = scenario.userActions.map((action, i) => ({
      order: i + 1,
      action
    }));

    const expectedResults: ExpectedResult[] = scenario.verificationPoints.map((desc, i) => ({
      order: i + 1,
      description: desc
    }));

    const finalPreconditions = [...globalPreconditions, ...scenario.preconditions];
    // Remove duplicates
    const uniquePreconditions = Array.from(new Set(finalPreconditions));

    return {
      id: `tc-llm-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      projectId,
      linkedRequirementIds: scenario.relatedRequirementIds || [],
      title: scenario.scenarioTitle || "제목 없음",
      objective: scenario.scenarioGoal || "목적 내용 없음",
      preconditions: uniquePreconditions,
      steps,
      expectedResults,
      priority: scenario.priority || "medium",
      status: "draft",
      automationCandidate: !!scenario.automationRecommended,
      automationSuitability: {
        score: scenario.automationRecommended ? 85 : 40,
        level: scenario.automationRecommended ? "high" : "low",
        reasons: scenario.automationRecommended
          ? ["안정적인 UI 감지 가능", "명확한 기대결과 보유"]
          : ["시나리오 분기 복잡", "육안 확인 필요"]
      }
    };
  });
}
