import { SourceDocument } from "../../features/documents/model";

export interface ParsedPdfResult {
  extractedText: string;
  tokens: number;
}

export async function parsePdfDocument(
  doc: SourceDocument
): Promise<ParsedPdfResult> {
  // Mock parser for now
  return {
    extractedText: `
1. 우상단 Info 아이콘을 클릭하면 SW 버전 표시 화면으로 이동된다.
2. 버전 화면에는 현재 설치된 SW 버전 정보가 표시되어야 한다.
3. 로그인 실패 시 에러 메시지가 표시되어야 한다.
    `.trim(),
    tokens: 2400,
  };
}
