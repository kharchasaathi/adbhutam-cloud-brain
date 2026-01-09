/**
 * core/007_response.js
 *
 * Response Layer (LLM-powered)
 * -----------------------------
 * - Converts FINAL pipeline state → human reply
 * - Delegates language + reasoning to ChatGPT
 * - Uses conversation memory (context carry)
 * - NO fake intelligence
 * - NO hardcoded answers
 */

import { callLLM } from "../server/llmGateway.js";
import { getMemory, addToMemory } from "./memory.js";

const Response = {};

Response.process = async function (finalPayload, rawText) {
  // Safety guard
  if (!rawText || !rawText.trim()) {
    return "Please type something first.";
  }

  /**
   * SYSTEM PROMPT
   * -------------
   * Stable identity + behavior rules
   */
  const systemPrompt = `
You are "Adbhutam Brain".

Rules:
- Understand Telugu, English, or mixed input
- Reply naturally in the SAME language as the user
- Be clear, concise, and human-like
- Use reasoning, not canned responses
- If information is missing, ASK instead of assuming
- Do NOT hallucinate facts or code
`;

  /**
   * BUILD CONVERSATION CONTEXT
   * --------------------------
   * Memory + current user input
   */
  const messages = [
    ...getMemory(),                 // previous turns
    { role: "user", content: rawText }
  ];

  /**
   * USER PROMPT
   * -----------
   * Includes system state (pipeline result)
   */
  const userPrompt = `
Conversation so far:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}

System State (JSON):
${JSON.stringify(finalPayload, null, 2)}

Task:
Generate the best possible reply for the user.
`;

  /**
   * 🔥 CALL LLM
   */
  const reply = await callLLM({
    system: systemPrompt,
    user: userPrompt
  });

  /**
   * 🧠 UPDATE MEMORY
   * ----------------
   * Store both user + assistant turns
   */
  addToMemory("user", rawText);
  addToMemory("assistant", reply);

  return reply;
};

export default Response;
