import { TestCaseDraft } from "../features/testcases/model";

export const mockTestCases: TestCaseDraft[] = [
  {
    id: "tc-001",
    projectId: "project-001",
    linkedRequirementIds: ["req-001"],
    title: "Info 아이콘 클릭 → 버전 화면 이동",
    objective: "Info 아이콘 클릭 시 SW 버전 화면이 표시되는지 확인",
    preconditions: ["앱 홈 화면에 진입한 상태"],
    steps: [
      { order: 1, action: "앱 홈 화면에 진입한다." },
      { order: 2, action: "우상단 Info 아이콘을 클릭한다." },
    ],
    expectedResults: [
      { order: 1, description: "SW 버전 화면으로 이동해야 한다." },
    ],
    priority: "high",
    status: "draft",
    automationCandidate: true,
    automationSuitability: {
      score: 90,
      level: "high",
      reasons: ["명확한 UI 이동 결과", "반복 검증 가치가 높음"],
    },
  },
];
