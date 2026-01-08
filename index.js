/**
 * index.js
 *
 * Adbhutam – Cloud Brain + API Server
 * ----------------------------------
 * - NO UI code
 * - NO missing imports
 * - Deterministic BrainCore
 * - Railway compatible
 * - Optional LLM test endpoint
 */

import express from "express";
import BrainCore from "./brain-core.js";
import { callLLM } from "./server/llmGateway.js";

/* ------------------------------------------------------------------
   🧠 CORE BRAIN RUNNER
------------------------------------------------------------------ */

async function runAdbhutam(rawText) {
  if (!rawText || String(rawText).trim() === "") {
    return {
      error: "Input is empty",
      reply: "Please type something first."
    };
  }

  // Deterministic brain (NO crash, NO AI dependency)
  const result = BrainCore.process(rawText);

  return {
    pipeline: ["understand", "decide"],
    result
  };
}

/* ------------------------------------------------------------------
   🚀 EXPRESS SERVER (RAILWAY)
------------------------------------------------------------------ */

const app = express();
app.use(express.json());

// Root check
app.get("/", (req, res) => {
  res.send("🚀 Adbhutam Cloud Brain is running");
});

// Health check (Railway needs this)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "adbhutam-cloud-brain" });
});

// Run brain
app.post("/run", async (req, res) => {
  try {
    const { input } = req.body;
    const output = await runAdbhutam(input);
    res.json({ ok: true, output });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// Optional LLM test (only if API key exists)
app.get("/test-llm", async (req, res) => {
  try {
    const out = await callLLM({
      type: "language",
      prompt: "Hello in Telugu"
    });
    res.json({ ok: true, out });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// Railway PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Adbhutam Cloud Brain running on port", PORT);
});
