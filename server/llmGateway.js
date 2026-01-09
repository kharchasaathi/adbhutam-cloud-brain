import fetch from "node-fetch";

const GEMINI_MODEL = "gemini-1.5-flash";

export async function callLLM(prompt) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // 1️⃣ ENV validation
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing in environment");
  }

  // 2️⃣ Prompt validation (⬅️ restored from old code)
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
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
            role: "user",
            parts: [{ text: prompt }]
          }
        ],

        // 3️⃣ Generation tuning
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512
        },

        // 4️⃣ Safety relaxed (important for Telugu / casual chat)
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUAL_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    }
  );

  // 5️⃣ Error handling
  if (!response.ok) {
    const err = await response.text();
    console.error("❌ Gemini raw error:", err);
    throw new Error("Gemini API failed");
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  return text.trim();
}
