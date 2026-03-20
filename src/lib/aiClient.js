/**
 * aiClient.js
 * ============================================================
 * AI 호출 추상화 레이어
 *
 * 기능별 모델 라우팅:
 *   - 요구사항 분석 / TC 생성  → Gemini 3.1 Pro (High)
 *   - 자동화 실행 판정         → Claude Sonnet 4.6 (Thinking)
 *
 * 모델 교체 시 이 파일만 수정하면 됨.
 * ============================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ──────────────────────────────────────────
// 모델 ID 설정 (2026.03 최신 버전 기준)
// ──────────────────────────────────────────
const GEMINI_MODEL  = 'gemini-flash-latest'; // ✅ ListModels 조회로 검증된 안정 모델
const CLAUDE_MODEL  = 'claude-3-5-sonnet-latest'; // 자동화 판정 (Claude 사용)

// ──────────────────────────────────────────
// 클라이언트 초기화
// ──────────────────────────────────────────
const geminiClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const anthropicClient = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});
const openaiClient = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function callGPT(systemPrompt, userPrompt) {
  const response = await openaiClient.chat.completions.create({
    model: GPT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });
  return response.choices[0].message.content;
}

async function callGemini(prompt) {
  const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ──────────────────────────────────────────
// 내부 헬퍼: Claude 호출
// ──────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt) {
  const response = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  // text block만 반환
  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * [Gemini 1.5 Flash] 요구사항 텍스트를 구조화된 분석 결과로 변환
 */
export async function analyzeRequirement(requirementText) {
  const prompt = `당신은 QA 엔지니어입니다. 요구사항 문서를 분석하여 JSON 형식으로만 응답하세요.\n\n요구사항:\n${requirementText}\n\n응답 형식 (JSON):\n{ "summary": "기능 요약", "requirements": [{ "id": 1, "tag": "태그", "text": "상세내용", "conf": "High|Medium|Low", "type": "normal|review" }], "risks": [{ "text": "리스크" }] }`;
  const raw = await callGemini(prompt);
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
  return JSON.parse(jsonMatch ? jsonMatch[1] : raw);
}

/**
 * [Gemini 1.5 Flash] 구조화된 요구사항으로부터 테스트케이스 초안 생성
 */
export async function generateTestCases(requirements, context) {
  const reqText = requirements.map((r, i) => `${i + 1}. [${r.tag}] ${r.text}`).join('\n');
  const prompt = `당신은 QA 엔지니어입니다. 아래 요구사항을 바탕으로 테스트케이스를 생성하세요.\n\n기능 요약: ${context}\n\n요구사항:\n${reqText}\n\n응답 형식 (JSON):\n{ "testCases": [{ "id": "TC-001", "title": "제목", "prereq": "조건", "priority": "높음|중간|낮음", "steps": "단계", "expected": "결과", "autoCandidate": true }] }`;
  const raw = await callGemini(prompt);
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
  const data = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
  return data.testCases.map(tc => ({ ...tc, status: 'draft', runStatus: null }));
}

/**
 * [Claude Thinking] 승인된 TC를 판정
 * (실제 배포 시 Playwright 실행 결과 + 스크린샷을 함께 전달)
 *
 * @param {Object} tc - 테스트케이스 객체
 * @param {string} executionNote - 실행 중 관찰된 사항 (Playwright 로그 등)
 * @returns {Promise<{status: 'pass'|'fail'|'review', reason: string}>}
 */
export async function judgeTestResult(tc, executionNote) {
  const systemPrompt = `
당신은 QA 자동화 판정 전문가입니다.
테스트케이스의 기대 결과와 실제 실행 결과를 비교하여 Pass/Fail/Review Needed를 판정합니다.
반드시 JSON만 응답하세요.
`;
  const userPrompt = `
테스트케이스:
- 제목: ${tc.title}
- 사전조건: ${tc.prereq}
- 단계: ${tc.steps}
- 기대결과: ${tc.expected}

실행 중 관찰된 사항:
${executionNote}

응답 형식 (JSON만):
{
  "status": "pass | fail | review",
  "reason": "판정 근거 (2~3문장, 한국어)"
}

판정 기준:
- pass: 기대결과와 실제 결과가 일치
- fail: 기대결과와 실제 결과가 명확히 불일치
- review: 결과가 모호하거나 추가 확인이 필요한 경우
`;
  const raw = await callClaude(systemPrompt, userPrompt);
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : raw;
  return JSON.parse(jsonStr.trim());
}

export function isConfigured() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY &&
    import.meta.env.VITE_GEMINI_API_KEY !== '여기에_실제_프로젝트_키_입력'
  );
}
