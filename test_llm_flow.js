import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function test() {
  const systemPrompt = "You are a QA Engineer...";
  const userPrompt = "Analyze the text: The system should allow user to login.";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}` }
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });
    
    if (!response.ok) {
        console.error("API Fetch Error:", await response.text());
        return;
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Raw API Output:", content);
    
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        console.error("No JSON braces found");
        return;
    }
    const cleanStr = content.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(cleanStr);
    console.log("Parsed keys:", Object.keys(parsed));
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
