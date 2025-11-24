// server.js
// Adbhutam Cloud Brain – simple, stable version

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// allow JSON upto ~10MB (files base64 కోసం)
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ----------------- MEMORY -----------------
const brainMemory = {
  logs: [],
  skills: {}
};

function log(type, text) {
  brainMemory.logs.push({ type, text, time: Date.now() });
  if (brainMemory.logs.length > 500) brainMemory.logs.shift();
}

// ----------------- INTENT -----------------
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

// ----------------- WIKIPEDIA -----------------
async function fetchKnowledge(query) {
  try {
    const url =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(query);

    const r = await fetch(url);
    if (!r.ok) {
      return "❌ Wikipedia fetch failed. (status " + r.status + ")";
    }
    const data = await r.json();
    return `📘 **${data.title}**\n\n${data.extract || "No summary."}`;
  } catch (e) {
    return "⚠ Wikipedia fetch failed: " + e.message;
  }
}

// ----------------- CORE BRAIN -----------------
async function runBrain(message = "", context = {}, files = []) {
  log("user", message || "[no message]");
  console.log("Incoming:", { message, fileCount: files.length });

  // 1) अगर files ఉంటే → simple file summary
  if (files && files.length > 0) {
    let out = "📂 **Files received:**\n";
    files.forEach((f, i) => {
      const sizeKB = f.size ? Math.round(f.size / 1024) : "?";
      out += `\n${i + 1}. ${f.name} (${sizeKB} KB)`;
    });

    out +=
      "\n\n🔎 ఈ version లో నేను files names + size మాత్రమే చూపిస్తున్నా.\n" +
      "Next upgrades లో actual code auto-fix + download links ఇస్తాను.";
    log("brain", out);
    return out;
  }

  // 2) Normal text query
  const intent = classifyIntent(message || "");
  const skill = brainMemory.skills[intent] || { name: intent, used: 0, history: [] };
  skill.used++;
  skill.history.push(message || "");
  brainMemory.skills[intent] = skill;

  let reply;

  switch (intent) {
    case "knowledge_query":
      reply = await fetchKnowledge(message);
      break;

    case "debugger":
      reply =
        "🔍 Debug mode ON.\n" +
        "నీ code (HTML/JS/CSS etc) text గా paste చెయ్యి. line-wise explain చేస్తాను.";
      break;

    case "repair_engine":
      reply =
        "🛠 Repair Engine ready.\n" +
        "Bug ఉన్న code పంపు, reason + fixed version ఇస్తాను.";
      break;

    case "frontend_builder":
      reply =
        "🎨 Frontend Builder ready.\n" +
        "Chat UI, dashboard UI లాంటివి అడుగు, నేను clean HTML/CSS/JS code ఇస్తాను.";
      break;

    case "backend_builder":
      reply =
        "🛠 Backend Builder ready.\n" +
        "Express APIs, DB structureల కోసం sample కోడ్ ఇస్తాను.";
      break;

    case "project_creator":
      reply =
        "📦 Project Creator ready.\n" +
        "నీ app idea చెప్పు (ఉదా: 'mobile shop inventory app'), నేను పూర్తి folders/files structure design చేస్తాను.";
      break;

    case "improver":
      reply =
        "⚙ Improver Mode ready.\n" +
        "నీ ఉన్న code పంపు, నేను performance + readabilityగా upgrade చేస్తాను.";
      break;

    default:
      reply =
        "🤖 General Mode: నీ instruction చూశాను.\n" +
        "Example: 'simple login page రాయ్', 'ఈ error explain చెయ్యి', 'HTML basics చెప్పు' వంటివి అడుగు బ్రో.";
  }

  log("brain", reply);
  return reply;
}

// ----------------- ROUTES -----------------
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    mode: "Adbhutam Cloud Brain",
    skills: Object.keys(brainMemory.skills)
  });
});

app.post("/api/chat", async (req, res) => {
  const { message, context, files } = req.body || {};

  if (!message && (!files || files.length === 0)) {
    return res.status(400).json({ error: "message or files missing" });
  }

  try {
    const reply = await runBrain(message, context || {}, files || []);
    res.json({ reply });
  } catch (e) {
    console.error("Brain error:", e);
    res.status(500).json({ error: "Brain exception", details: e.message });
  }
});

// ----------------- START -----------------
app.listen(PORT, () => {
  console.log("🚀 Adbhutam Cloud Brain running on port " + PORT);
});
