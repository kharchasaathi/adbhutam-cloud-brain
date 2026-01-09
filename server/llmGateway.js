/**
 * LLM Gateway (GROQ)
 * =================
 * - Free / fast
 * - No credit card
 * - Language + code both supported
 * - Railway compatible
 */

import fetch from "node-fetch";

/* =======================
   GROQ CONFIG
======================= */

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Best general-purpose Groq model
const GROQ_MODEL = "llama-3.1-8b-instant";

/* =======================
   MAIN FUNCTION
======================= */

export async function callLLM(prompt) {
  // 1️⃣ ENV validation
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY missing in environment");
  }

  // 2️⃣ Prompt validation
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, concise assistant. Reply naturally. Telugu is allowed."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 512
      })
    }
  );

  // 3️⃣ Error handling
  if (!response.ok) {
    const err = await response.text();
    console.error("❌ Groq raw error:", err);
    throw new Error("Groq API failed");
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Empty Groq response");
  }

  return text.trim();
}
