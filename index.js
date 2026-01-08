/**
 * index.js
 * Adbhutam Cloud Brain – API Server ONLY
 * (NO UI imports, NO core pipeline here)
 */

import express from "express";
import { callLLM } from "./server/llmGateway.js";
import BrainCore from "./brain-core.js";

const app = express();
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
  const { message = "" } = req.body || {};
  const result = BrainCore.process(message);
  res.json({ ok: true, result });
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
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* -------------------
   START
------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Cloud Brain listening on", PORT);
});
