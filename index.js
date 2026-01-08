/**
 * index.js
 * Adbhutam Cloud Brain – API Server
 * --------------------------------
 * - Deterministic BrainCore
 * - Gemini LLM gateway
 * - CORS enabled (GitHub Pages safe)
 * - Railway production ready
 */

import express from "express";
import cors from "cors";
import BrainCore from "./brain-core.js";
import { callLLM } from "./server/llmGateway.js";

const app = express();

/* -------------------
   MIDDLEWARE
------------------- */

app.use(cors());
app.use(express.json());

/* -------------------
   HEALTH
------------------- */

app.get("/", (req, res) => {
  res.send("✅ Adbhutam Cloud Brain is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* -------------------
   BRAIN (DETERMINISTIC)
------------------- */

app.post("/brain", (req, res) => {
  try {
    const { message = "" } = req.body || {};
    const result = BrainCore.process(message);

    res.json({
      ok: true,
      result
    });
  } catch (e) {
    console.error("🧠 Brain error:", e);

    res.status(500).json({
      ok: false,
      error: "Brain processing failed"
    });
  }
});

/* -------------------
   LLM (GEMINI ONLY)
------------------- */

app.post("/llm", async (req, res) => {
  try {
    const { prompt = "" } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Prompt is required"
      });
    }

    const out = await callLLM(prompt);

    res.json({
      ok: true,
      out
    });
  } catch (e) {
    console.error("🤖 LLM error:", e);

    res.status(500).json({
      ok: false,
      error: e.message
    });
  }
});

/* -------------------
   START (RAILWAY)
------------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Adbhutam Cloud Brain listening on port", PORT);
});
