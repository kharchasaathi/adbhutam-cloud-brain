const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory memory
const brainMemory = {
  logs: [],
  skills: {}
};

// Log helper
function log(type, text) {
  brainMemory.logs.push({ type, text, time: Date.now() });
  if (brainMemory.logs.length > 500) brainMemory.logs.shift();
}

// Intent classifier
function classifyIntent(text = "") {
  const t = text.toLowerCase();

  if (
    t.includes("what is") ||
    t.includes("who is") ||
    t.includes("explain") ||
    t.includes("గురించి") ||
    t.includes("తెలుసుకోవాలి") ||
    t.includes("information") ||
    t.includes("details")
  ) return "knowledge_query";

  if (t.includes("error") || t.includes("debug")) return "debugger";
  if (t.includes("html") || t.includes("css") || t.includes("javascript")) return "frontend_builder";
  if (t.includes("backend") || t.includes("api") || t.includes("node")) return "backend_builder";
  if (t.includes("project")) return "project_creator";
  if (t.includes("improve")) return "improver";
  if (t.includes("repair") || t.includes("fix") || t.includes("ఎర్రర్")) return "repair_engine";

  return "general_skill";
}

// Wikipedia knowledge fetcher
async function fetchKnowledge(query) {
  try {
    const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(query);
    const r = await fetch(url);

    if (!r.ok) return "❌ Knowledge fetch failed (status " + r.status + ").";

    const data = await r.json();
    return `📘 **${data.title}**\n\n${data.extract || "No summary."}`;
  } catch (e) {
    return "⚠ Knowledge API error: " + e.message;
  }
}

// Core brain
async function runBrain(message, context = {}) {
  log("user", message);
  const intent = classifyIntent(message);

  const skill = brainMemory.skills[intent] || { name: intent, used: 0, history: [] };
  skill.used++;
  skill.history.push(message);
  brainMemory.skills[intent] = skill;

  if (intent === "knowledge_query") return await fetchKnowledge(message);

  if (intent === "debugger")
    return "🔍 Debug mode ON.\nనీ code పంపు. నేను line-wise explain చేస్తాను.";

  if (intent === "repair_engine")
    return "🛠 Repair Engine: bug ఉన్న code పంపు. నేను analyse చేసి fixed version ఇస్తాను.";

  if (intent === "frontend_builder")
    return "🎨 Frontend Builder: నీ UI structure అడుగు, నేను clean HTML/CSS/JS code ఇస్తాను.";

  if (intent === "backend_builder")
    return "🛠 Backend Builder: Express APIs + DB structures కోసం sample కోడ్ ఇస్తాను.";

  if (intent === "project_creator")
    return "📦 Project Creator: నీ app idea చెప్పు. నేను folders/files structure design చేస్తాను.";

  if (intent === "improver")
    return "⚙ Improver Mode: code పంపు. నేను performance + readabilityగా upgrade చేస్తాను.";

  return "🤖 General Mode: నీ instruction చూశాను. ఇంకాస్త clearly అడుగు బ్రో!";
}

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, mode: "Adbhutam Cloud Brain", skills: Object.keys(brainMemory.skills) });
});

// Chat API
app.post("/api/chat", async (req, res) => {
  const { message, context, files } = req.body || {};

  if (!message && !files) {
    return res.status(400).json({ error: "message or files missing" });
  }

  try {
    const reply = await runBrain(message, context || {}, files || []);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Brain exception", details: e.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Adbhutam Cloud Brain running on port " + PORT);
});
