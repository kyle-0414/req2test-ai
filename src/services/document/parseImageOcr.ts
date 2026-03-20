import { createWorker } from 'tesseract.js';

export interface OcrResult {
  ocrText: string;
  extractedText: string;
  tokens: number;
}

export async function parseImageOcr(imageSource: File | string | Blob): Promise<OcrResult> {
  // Use OEM 1 (LSTM only) for best accuracy in modern Tesseract
  const worker = await createWorker(['eng', 'kor']);
  
  try {
    const { data: { text } } = await worker.recognize(imageSource);
    
    // Approximate tokens based on common 1 token ≈ 4 chars rule
    const approximateTokens = Math.ceil(text.length / 4);

    return {
      ocrText: text,
      extractedText: text,
      tokens: approximateTokens,
    };
  } catch (error: any) {
    console.error("OCR Error:", error);
    throw new Error(error.message || "Failed to parse image via OCR.");
  } finally {
    await worker.terminate();
  }
}
