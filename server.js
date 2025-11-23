const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Memory
const brainMemory = {
  logs: [],
  skills: {}
};

// Helper
function log(type, text) {
  brainMemory.logs.push({ type, text, time: Date.now() });
  if (brainMemory.logs.length > 500) brainMemory.logs.shift();
}

// Intent Detector
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

// Wikipedia API
async function fetchKnowledge(query) {
  try {
    const proxyURL = "https://adbhutam-brain.onrender.com/api/wiki?q=" + encodeURIComponent(query);
    const r = await fetch(proxyURL);

    const data = await r.json();
    if (data.error) return "❌ Wikipedia fetch failed.";

    return `📘 **${data.title}**\n\n${data.extract}`;
  } catch (e) {
    return "⚠ Wikipedia error: " + e.message;
  }
}

// ---------------------------
//        AI CORE BRAIN 
// ---------------------------
async function runBrain(message, context = {}, files = []) {
  log("user", message);

  // 1. FILE ANALYZER MODE
  if (files && files.length > 0) {
    return await analyzeFiles(files, message);
  }

  // 2. TEXT-ONLY MODES
  const intent = classifyIntent(message);

  const skill = brainMemory.skills[intent] || { name: intent, used: 0, history: [] };
  skill.used++;
  skill.history.push(message);
  brainMemory.skills[intent] = skill;

  if (intent === "knowledge_query") return await fetchKnowledge(message);

  if (intent === "debugger")
    return "🔍 Debug mode ON.\nనీ code పంపు, నేను line-wise explain చేస్తాను.";

  if (intent === "repair_engine")
    return "🛠 Repair Engine ready.\nBug ఉన్న code పంపు.";

  if (intent === "frontend_builder")
    return "🎨 Frontend Builder ready.\nUI structure అడుగు.";

  if (intent === "backend_builder")
    return "🛠 Backend Builder ready.\nAPIs / DB అడుగు.";

  if (intent === "project_creator")
    return "📦 Project Creator ready.\nనీ idea చెప్పు.";

  if (intent === "improver")
    return "⚙ Improver Mode ready.\nCode పంపు.";

  return "🤖 General Mode working.";
}

// ---------------------------
//     FILE ANALYZER ENGINE
// ---------------------------
async function analyzeFiles(files, userMessage) {
  let final = "📂 **Files received:**\n";

  for (let f of files) {
    const base64Data = f.data.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const originalText = buffer.toString("utf8");

    const lang = detectLanguage(f.name, originalText);
    const fixedText = autoFixCode(originalText, lang);

    const filePath = createFixedFile(f.name, fixedText);

    final += `\n### 📌 ${f.name}  (${lang})\n`;
    final += `🛠 Auto-Fixed File Ready\n`;
    final += `⬇ Download: https://adbhutam-brain.onrender.com/download?file=${encodeURIComponent(filePath)}\n`;
  }

  return final;
}

// Detect File Language
function detectLanguage(filename, text) {
  const ext = filename.split(".").pop().toLowerCase();

  if (ext === "html") return "HTML";
  if (ext === "css") return "CSS";
  if (ext === "js") return "JavaScript";
  if (ext === "json") return "JSON";
  if (ext === "py") return "Python";
  if (ext === "java") return "Java";

  if (text.includes("<html")) return "HTML";
  if (text.includes("function")) return "JavaScript";

  return "Unknown";
}

// AutoFix Engine
function autoFixCode(text, lang) {
  let fixed = text;

  fixed = fixed.replace(/\t/g, "  ");
  fixed = fixed.replace(/ +$/gm, "");
  fixed = fixed.replace(/\n{3,}/g, "\n\n");

  if (lang === "JavaScript") {
    fixed = fixed.replace(/var /g, "let ");
    fixed = fixed.replace(/==([^=])/g, " ===$1");
  }

  if (lang === "HTML") {
    if (!fixed.includes("<html")) {
      fixed = "<!DOCTYPE html>\n<html>\n" + fixed + "\n</html>";
    }
  }

  return fixed;
}

// Save Fixed File
function createFixedFile(originalName, text) {
  const fixedName = originalName.replace(/\.(.*)/, "_fixed.$1");
  const folder = path.join(__dirname, "fixed_files");

  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const filePath = path.join(folder, fixedName);
  fs.writeFileSync(filePath, text, "utf8");

  return filePath;
}
// Wikipedia Proxy API (No CORS, No Block)
app.get("/api/wiki", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Query missing" });

    const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(q);

    const r = await fetch(url);
    if (!r.ok) return res.json({ error: "Wikipedia fetch failed" });

    const data = await r.json();
    res.json({
      title: data.title,
      extract: data.extract
    });

  } catch (e) {
    res.json({ error: "Wiki Proxy Error", details: e.message });
  }
});

// Download Route
app.get("/download", (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).send("File missing");
  res.download(file);
});

// Health Check
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    mode: "Adbhutam Cloud Brain",
    skills: Object.keys(brainMemory.skills)
  });
});

// Chat API
app.post("/api/chat", async (req, res) => {
  const { message, context, files } = req.body || {};

  if (!message && !files) {
    return res.status(400).json({ error: "Message or files missing" });
  }

  try {
    const reply = await runBrain(message, context || {}, files || []);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Brain error", details: e.message });
  }
});

// Server
app.listen(PORT, () => {
  console.log("🚀 Adbhutam Brain running on " + PORT);
});
