/**
 * Lightweight client to handle LLM calls.
 * Designed to be easily replaceable with a backend API later.
 */

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
}

export async function callLLM(request: LLMRequest): Promise<string> {
  // Try to use a provided API key. Default to undefined.
  const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("No LLM API key configured in environment. API key is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Use a fast/cheap model by default
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      response_format: { type: "json_object" }, // ensure JSON output
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content found in LLM response");
  }

  return content;
}
