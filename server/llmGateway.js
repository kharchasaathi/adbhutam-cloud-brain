/**
 * LLM Gateway
 * ===========
 * Central secure router for all LLM calls
 *
 * language → Gemini
 * code     → OpenAI
 *
 * - NO UI
 * - NO business logic
 * - Cost & safety controlled
 */

import fetch from "node-fetch";

/* =======================
   ENV CONFIG
======================= */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// OpenAI config (CODE)
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_MAX_TOKENS = 1200;
const OPENAI_TEMPERATURE = 0.2;

// Gemini config (LANGUAGE)
const GEMINI_MODEL = "gemini-1.5-flash";

/* =======================
   MAIN GATEWAY
======================= */

/**
 * callLLM
 * @param {string} type - "language" | "code"
 * @param {string} prompt
 */
export async function callLLM(type, prompt) {
  if (!type || !prompt) {
    throw new Error("callLLM requires type and prompt");
  }

  if (type === "language") {
    return await callGemini(prompt);
  }

  if (type === "code") {
    return await callOpenAI(prompt);
  }

  throw new Error(`Unknown LLM type: ${type}`);
}

/* =======================
   GEMINI (LANGUAGE)
======================= */

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

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
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Invalid Gemini response format");
  }

  return text.trim();
}

/* =======================
   OPENAI (CODE)
======================= */

async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer. Return clean, correct, production-ready code only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: OPENAI_MAX_TOKENS,
        temperature: OPENAI_TEMPERATURE
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Invalid OpenAI response format");
  }

  return text.trim();
}
