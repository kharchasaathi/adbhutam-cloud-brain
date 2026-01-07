// server.js
// Adbhutam Cloud Brain – SAFE CORE v1
// AI is OPTIONAL, not mandatory

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * ===============================
 * CONFIG (SAFE)
 * ===============================
 */

// AI toggle (true / false)
const AI_ENABLED = process.env.AI_ENABLED === "true";

// OpenAI key ONLY from env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Hard limits (crash prevention)
const MAX_FILES = 3;
const MAX_FILE_CHARS = 4000;
const MAX_LOGS = 200;

/**
 * ===============================
 * MIDDLEWARE
 * ===============================
 */

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/**
 * ===============================
 * MEMORY (deterministic)
 * ===============================
 */

const brainMemory = {
  logs: []
};

function log(kind, payload) {
  brainMemory.logs.push({
    kind,
    time: new Date().toISOString(),
    payload
  });
  if (brainMemory.logs.length > MAX_LOGS) {
    brainMemory.logs.shift();
  }
}

/**
 * ===============================
 * FILE CONTEXT BUILDER
 * ===============================
 */

function buildFileContext(files = []) {
  if (!Array.isArray(files) || files.length === 0) return "";

  const limited = files.slice(0, MAX_FILES);
  let out =
    "Attached files (read-only context, do NOT assume correctness):\n";

  for (const f of limited) {
    try {
      const base64 = (f.data || "").split(",")[1] || "";
      const buffer = Buffer.from(base64, "base64");
      let text = buffer.toString("utf8");

      if (text.length > MAX_FILE_CHARS) {
        text = text.slice(0, MAX_FILE_CHARS) + "\n...[truncated]...";
      }

      out += `
------------------------------
File: ${f.name}
Type: ${f.type}
Size: ${Math.round((f.size || 0) / 1024)} KB
Content:
${text}
`;
    } catch (e) {
      out += `\n[File decode failed: ${f.name}]\n`;
    }
  }

  return out;
}

/**
 * ===============================
 * AI CALLER (OPTIONAL)
 * ===============================
 */

async function callOpenAI(messages) {
  if (!AI_ENABLED) {
    return "🧠 AI disabled. System running in deterministic mode.";
  }

  if (!OPENAI_API_KEY) {
    return "⚠ AI enabled but OPENAI_API_KEY missing.";
  }

  try {
    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
          max_tokens: 800
        })
      }
    );

    if (!res.ok) {
      const t = await res.text();
      log("openai_error", t.slice(0, 300));
      return "❌ AI backend error.";
    }

    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ||
      "⚠ Empty AI reply."
    ).trim();
  } catch (err) {
    log("openai_exception", err.message);
    return "⚠ AI exception occurred.";
  }
}

/**
 * ===============================
 * CORE BRAIN
 * ===============================
 */

const SYSTEM_PROMPT = `
You are "Adbhutam Brain".
- Answer in Telugu + simple English.
- Be precise, structured.
- If code is requested, respond with clean code blocks.
- Never assume files are correct; analyze them.
`;

async function runBrain(message, files = []) {
  const fileContext = buildFileContext(files);

  let userContent = message || "";
  if (fileContext) {
    userContent += "\n\n[FILES]\n" + fileContext;
  }

  const reply = await callOpenAI([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent }
  ]);

  log("reply", {
    ai: AI_ENABLED,
    messageSize: message.length,
    files: files.length
  });

  return reply;
}

/**
 * ===============================
 * ROUTES
 * ===============================
 */

// Health
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    version: "Adbhutam Core v1",
    aiEnabled: AI_ENABLED,
    logs: brainMemory.logs.length
  });
});

// Chat
app.post("/api/chat", async (req, res) => {
  const { message = "", files = [] } = req.body || {};

  if (!message && (!files || files.length === 0)) {
    return res
      .status(400)
      .json({ error: "message or files required" });
  }

  log("request", {
    msg: message.slice(0, 120),
    files: files.length
  });

  try {
    const reply = await runBrain(message, files);
    res.json({ reply });
  } catch (e) {
    log("fatal", e.message);
    res.status(500).json({
      error: "Brain failure",
      details: e.message
    });
  }
});

/**
 * ===============================
 * START
 * ===============================
 */

app.listen(PORT, () => {
  console.log(
    "🚀 Adbhutam Core running on port",
    PORT,
    "| AI:",
    AI_ENABLED ? "ON" : "OFF"
  );
});
