/**
 * index.js
 * Adbhutam Cloud Brain – API Server ONLY
 * ------------------------------------
 * - NO UI imports
 * - Deterministic BrainCore
 * - Optional LLM gateway
 * - CORS enabled (GitHub Pages compatible)
 * - Railway ready
 */

import express from "express";
import cors from "cors";                  // ✅ ADD
import BrainCore from "./brain-core.js";
import { callLLM } from "./server/llmGateway.js";

const app = express();

/* -------------------
   MIDDLEWARE
------------------- */

// ✅ VERY IMPORTANT: allow GitHub Pages / browser access
app.use(cors());

// Parse JSON bodies
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
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: "Brain processing failed"
    });
  }
});

/* -------------------
   LLM (OPTIONAL)
------------------- */

app.post("/llm", async (req, res) => {
  try {
    const { type, prompt } = req.body;
    const out = await callLLM(type, prompt);
    res.json({ ok: true, out });
  } catch (e) {
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
