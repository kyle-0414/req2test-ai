export const REQUIREMENTS = [
  { id: 1, tag: '화면 이동', text: 'Info 아이콘 클릭 시 SW 버전 정보 화면으로 이동', conf: 'High', type: 'normal' },
  { id: 2, tag: '콘텐츠 표시', text: '버전 정보 화면에 SW Version 및 Build Date 표시', conf: 'High', type: 'normal' },
  { id: 3, tag: '권한 제어', text: '로그인된 사용자에게만 Info 아이콘 표시', conf: 'Medium', type: 'review' },
  { id: 4, tag: '뒤로가기', text: '뒤로가기 버튼 클릭 시 App Home으로 복귀', conf: 'High', type: 'normal' },
];

export const INITIAL_TCS = [
  {
    id: 'TC-001', title: 'Info 아이콘 존재 여부 확인',
    prereq: '앱 홈 화면 진입 상태', priority: '높음',
    steps: '1. 앱 홈 화면 진입\n2. 우상단 영역에서 Info 아이콘 확인',
    expected: '원형 Info 아이콘이 우상단에 표시된다',
    autoCandidate: true, status: 'draft', runStatus: null
  },
  {
    id: 'TC-002', title: 'Info 아이콘 클릭 → 버전 화면 이동',
    prereq: '앱 홈 화면 진입 상태', priority: '높음',
    steps: '1. Info 아이콘 클릭\n2. 이동된 화면 확인',
    expected: 'SW 버전 정보 화면으로 이동된다',
    autoCandidate: true, status: 'draft', runStatus: null
  },
  {
    id: 'TC-003', title: 'SW Version 및 Build Date 텍스트 확인',
    prereq: '버전 정보 화면 진입 상태', priority: '높음',
    steps: '1. 버전 정보 화면 진입\n2. 텍스트 항목 확인',
    expected: 'SW Version과 Build Date 문자열이 표시된다',
    autoCandidate: true, status: 'draft', runStatus: null
  },
  {
    id: 'TC-004', title: '뒤로가기 → App Home 복귀',
    prereq: '버전 정보 화면 진입 상태', priority: '중간',
    steps: '1. 뒤로가기 버튼 클릭\n2. 이동 후 화면 확인',
    expected: 'App Home 화면으로 복귀된다',
    autoCandidate: true, status: 'draft', runStatus: null
  },
];

export const MOCK_ANALYSIS = {
  summary: 'Info 아이콘 클릭 시 SW 버전 정보 화면을 표시하는 기능',
  requirements: [
    { id: 1, tag: '화면 이동', text: 'Info 아이콘 클릭 시 SW 버전 정보 화면으로 이동', conf: 'High', type: 'normal' },
    { id: 2, tag: '콘텐츠 표시', text: '버전 화면에 SW Version 및 Build Date 표시', conf: 'High', type: 'normal' },
    { id: 3, tag: '권한 제어', text: '로그인된 사용자에게만 Info 아이콘 표시', conf: 'Medium', type: 'review' },
    { id: 4, tag: '뒤로가기', text: '뒤로가기 버튼 클릭 시 App Home으로 복귀', conf: 'High', type: 'normal' },
  ],
  risks: [{ text: 'Info 화면의 팝업 vs 화면전환 방식이 명세에서 모호함' }],
};

export const MOCK_TCS = [
  { id: 'TC-001', title: 'Info 아이콘 존재 여부 확인', prereq: '앱 홈 화면 진입 상태', priority: '높음', steps: '1. 앱 홈 화면 진입\n2. 우상단 영역에서 Info 아이콘 확인', expected: '원형 Info 아이콘이 우상단에 표시된다', autoCandidate: true, status: 'draft', runStatus: null },
  { id: 'TC-002', title: 'Info 아이콘 클릭 → 버전 화면 이동', prereq: '앱 홈 화면 진입 상태', priority: '높음', steps: '1. Info 아이콘 클릭\n2. 이동된 화면 확인', expected: 'SW 버전 정보 화면으로 이동된다', autoCandidate: true, status: 'draft', runStatus: null },
  { id: 'TC-003', title: 'SW Version 및 Build Date 텍스트 확인', prereq: '버전 정보 화면 진입 상태', priority: '높음', steps: '1. 버전 정보 화면 진입\n2. 텍스트 항목 확인', expected: 'SW Version과 Build Date 문자열이 표시된다', autoCandidate: true, status: 'draft', runStatus: null },
  { id: 'TC-004', title: '뒤로가기 → App Home 복귀', prereq: '버전 정보 화면 진입 상태', priority: '중간', steps: '1. 뒤로가기 버튼 클릭\n2. 이동 후 화면 확인', expected: 'App Home 화면으로 복귀된다', autoCandidate: true, status: 'draft', runStatus: null },
];
