/**
 * index.js
 *
 * Adbhutam – Brain + API Server
 * -----------------------------
 * - Preserves FULL old pipeline behavior
 * - Adds Express server for Railway
 * - Adds LLM (Gemini / OpenAI) support
 * - Works for UI + API + Future apps
 */

import express from "express";

// 🧠 Brain pipeline
import Understand from "./core/001_understand.js";
import Decide from "./core/002_decide.js";
import Plan from "./core/003_plan.js";
import Execute from "./core/004_execute.js";
import Validate from "./core/005_validate.js";
import Finalize from "./core/006_finalize.js";
import Response from "./core/007_response.js";

// 🔌 LLM Gateway
import { callLLM } from "./server/llmGateway.js";

/* ------------------------------------------------------------------
   🧠 CORE BRAIN FUNCTION (OLD BEHAVIOR 100% PRESERVED)
------------------------------------------------------------------ */

async function runAdbhutam(rawText) {

  if (!rawText || String(rawText).trim() === "") {
    return {
      stage: "ui",
      error: "Input is empty",
      reply: "Please type something first."
    };
  }

  // 001 – Understand
  const u = Understand.process(rawText);

  // 002 – Decide
  const d = Decide.process(u);

  // 003 – Plan
  const p = Plan.process(d, u);

  // 004 – Execute
  const e = Execute.process(p);

  // 005 – Validate
  const v = Validate.process(e);

  // 006 – Finalize
  const f = Finalize.process(v);

  const pipelineResult = {
    pipeline: [
      "001_understand",
      "002_decide",
      "003_plan",
      "004_execute",
      "005_validate",
      "006_finalize"
    ],
    result: f
  };

  // 🧠 LLM-generated human reply
  const replyText = await Response.process(pipelineResult, rawText);

  return {
    ...pipelineResult,
    reply: replyText
  };
}

/* ------------------------------------------------------------------
   🌐 BROWSER COMPATIBILITY (NO BREAKAGE)
------------------------------------------------------------------ */

if (typeof window !== "undefined") {
  window.runAdbhutam = runAdbhutam;
}

/* ------------------------------------------------------------------
   🚀 EXPRESS SERVER (FOR RAILWAY)
------------------------------------------------------------------ */

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Adbhutam API is running");
});

// 🔍 Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🧠 Full brain execution via API
app.post("/run", async (req, res) => {
  try {
    const { input } = req.body;
    const output = await runAdbhutam(input);
    res.json({ ok: true, output });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 🧪 Direct LLM test
app.get("/test-llm", async (req, res) => {
  try {
    const out = await callLLM({
      type: "language",
      prompt: "Hello in Telugu"
    });
    res.json({ ok: true, out });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚪 Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Adbhutam server running on port", PORT);
});
