/**
 * LLM Gateway (Gemini ONLY)
 * ========================
 * Central secure router for all LLM calls
 *
 * - language → Gemini
 * - code     → Gemini
 *
 * - NO UI
 * - NO business logic
 * - Railway compatible
 * - Free / low-cost friendly
 */

import fetch from "node-fetch";

/* =======================
   ENV CONFIG
======================= */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is not set");
}

/* =======================
   GEMINI CONFIG
======================= */

const GEMINI_MODEL = "gemini-1.5-flash";

/* =======================
   MAIN GATEWAY
======================= */

/**
 * callLLM
 * @param {string} prompt
 * @returns {string}
 */
export async function callLLM(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("callLLM requires a prompt string");
  }

  return await callGemini(prompt);
}

/* =======================
   GEMINI IMPLEMENTATION
======================= */

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Invalid Gemini response format");
  }

  return text.trim();
}
