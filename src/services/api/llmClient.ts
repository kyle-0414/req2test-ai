/**
 * Lightweight client to handle LLM calls.
 * Designed to be easily replaceable with a backend API later.
 */

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
}

export async function callLLM(request: LLMRequest): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. (VITE_GEMINI_API_KEY is missing)");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // System instruction is passed separately so Gemini treats it as a true system directive,
      // not just another user message. This is critical for instruction-following behavior.
      systemInstruction: {
        parts: [{ text: request.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: request.userPrompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,  // Slightly higher to encourage creative derivation, not copying
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Empty response from Gemini API");
  }

  return content;
}
