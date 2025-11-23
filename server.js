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
async function runBrain(message, context = {}, files = []) {
  log("user", message);

  // If files are attached → run file-analyzer mode
  async function analyzeFiles(files, userMessage) {
  let final = "📂 **Files received:**\n";

  for (let f of files) {
    const base64Data = f.data.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const originalText = buffer.toString("utf8");

    const lang = detectLanguage(f.name, originalText);
    const fixedText = autoFixCode(originalText, lang);
    const filePath = createFixedFile(f.name, fixedText);

    final += `\n### 📌 **${f.name}** (${lang})\n`;
    final += `🛠 Auto-Fixed File Ready\n`;
    final += `⬇ Download: https://adbhutam-brain.onrender.com/download?file=${encodeURIComponent(filePath)}\n`;
  }

  return final;
}
  // === regular text queries ===
  const intent = classifyIntent(message);
  const skill = brainMemory.skills[intent] || { name: intent, used: 0, history: [] };
  skill.used++;
  skill.history.push(message);
  brainMemory.skills[intent] = skill;

  if (intent === "knowledge_query") return await fetchKnowledge(message);

  if (intent === "debugger")
    return "🔍 Debug mode ON.\nనీ code పంపు (HTML/JS/CSS/Python etc). నేను line-wise explain చేస్తాను.";

  if (intent === "repair_engine")
    return "🛠 Repair Engine ready.\nBug ఉన్న code పంపు.";

  if (intent === "frontend_builder")
    return "🎨 Frontend Builder ready.\nUI structure అడుగు.";

  if (intent === "backend_builder")
    return "🛠 Backend Builder ready.\nAPI / DB design అడుగు.";

  if (intent === "project_creator")
    return "📦 Project Creator ready.\nనీ app idea చెప్పు.";

  if (intent === "improver")
    return "⚙ Improver Mode ready.\nCode పంపు.";

  return "🤖 General Mode: instruction చెప్పు బ్రో.";
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
async function analyzeFiles(files, userMessage) {
  let output = "📂 **Files received:**\n";

  let analysis = [];

  for (let f of files) {
    output += `- ${f.name} (${Math.round(f.size/1024)} KB)\n`;

    // Extract plain text from base64
    const base64Data = f.data.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const text = buffer.toString("utf8");

    const lang = detectLanguage(f.name, text);

    const errors = findErrors(text);
    const improved = improveCode(text);

    analysis.push({
      file: f.name,
      language: lang,
      errors,
      improved
    });
  }

  // Build final response
  let final = output + "\n";

  for (let a of analysis) {
    final += `\n📌 **${a.file}** (${a.language})\n`;
    final += `\n❗ **Detected Errors:**\n${a.errors}\n`;
    final += `\n✨ **Improved Version:**\n${a.improved}\n`;
  }

  return final;
}
function detectLanguage(filename, text) {
  const ext = filename.split(".").pop().toLowerCase();

  if (ext === "html") return "HTML";
  if (ext === "css") return "CSS";
  if (ext === "js") return "JavaScript";
  if (ext === "json") return "JSON";
  if (ext === "py") return "Python";
  if (ext === "java") return "Java";

  if (text.includes("function") || text.includes("=>")) return "JavaScript";
  if (text.includes("<html")) return "HTML";

  return "Unknown";
}
function findErrors(text) {
  let lines = text.split("\n");

  let errors = [];

  lines.forEach((line, i) => {
    if (line.includes("<<") || line.includes(">>")) {
      errors.push(`Line ${i+1}: Invalid symbols (<< >>)`);
    }
    if (line.includes("require(") && !line.includes("const")) {
      errors.push(`Line ${i+1}: 'require' used incorrectly`);
    }
    if (line.includes("=") && line.trim().startsWith("=")) {
      errors.push(`Line ${i+1}: Assignment operator error`);
    }
  });

  return errors.length ? errors.join("\n") : "No bugs found 🎉";
}
function improveCode(text) {
  let improved = text
    .replace(/\t/g, "  ")          // tabs → spaces
    .replace(/ +$/gm, "")          // trailing spaces remove
    .replace(/\n{3,}/g, "\n\n");   // multiple blank lines reduce

  return improved;
}
function autoFixCode(text, lang) {
  let fixed = text;

  // Common fixes
  fixed = fixed.replace(/\t/g, "  ");
  fixed = fixed.replace(/ +$/gm, "");
  fixed = fixed.replace(/\n{3,}/g, "\n\n");

  // JavaScript-specific fixes
  if (lang === "JavaScript") {
    fixed = fixed.replace(/var /g, "let ");
    fixed = fixed.replace(/==([^=])/g, " ===$1");
  }

  // HTML-specific fixes
  if (lang === "HTML") {
    if (!fixed.includes("<html")) {
      fixed = "<!DOCTYPE html>\n<html>\n" + fixed + "\n</html>";
    }
  }

  return fixed;
}
const fs = require("fs");
const path = require("path");

function createFixedFile(originalName, text) {
  const fixedName = originalName.replace(/\.(.*)/, "_fixed.$1");
  const savePath = path.join(__dirname, "fixed_files");

  if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);

  const filePath = path.join(savePath, fixedName);
  fs.writeFileSync(filePath, text, "utf8");

  return filePath;
}
app.get("/download", (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).send("File missing");

  res.download(file);
});


