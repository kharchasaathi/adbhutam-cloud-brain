// server.js
// Adbhutam Cloud Brain – LLM backend (OpenAI GPT-4o-mini)

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = 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

// Basic in-memory logs (optional)
const brainMemory = {
  logs: []
};

app.use(cors());
app.use(express.json({ limit: "10mb" })); // files కోసం కొంచెం పెంచాం

function log(kind, payload) {
  brainMemory.logs.push({
    kind,
    time: new Date().toISOString(),
    payload
  });
  if (brainMemory.logs.length > 200) brainMemory.logs.shift();
}

// ------------ OpenAI helper ------------

async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY missing");
    return "⚠ Server config error: OPENAI_API_KEY సెటప్ చేయలేదు.";
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 900
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenAI error:", res.status, text.slice(0, 500));
      return "❌ AI backend error (" + res.status + ").";
    }

    const data = await res.json();
    const content =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    return (content || "⚠ Empty reply from AI.").trim();
  } catch (err) {
    console.error("OpenAI exception:", err);
    return "⚠ AI backend exception: " + err.message;
  }
}

// ------------ File handling helpers ------------

function buildFileContext(files = []) {
  if (!files || !files.length) return "";

  // max 3 files, ఒక్కొక్కటి 4000 chars వరకు
  const limited = files.slice(0, 3);
  let out = "User attached some files. For each file, read the content and use it while answering.\n";

  for (const f of limited) {
    try {
      const base64 = (f.data || "").split(",")[1] || "";
      const buffer = Buffer.from(base64, "base64");
      let text = buffer.toString("utf8");

      if (text.length > 4000) {
        text = text.slice(0, 4000) + "\n...[truncated]...";
      }

      out += `\n------------------------------\n`;
      out += `File name: ${f.name}\n`;
      out += `Type: ${f.type}\n`;
      out += `Size: ${Math.round((f.size || 0) / 1024)} KB\n`;
      out += `Content:\n${text}\n`;
    } catch (e) {
      console.error("File decode error:", e);
    }
  }

  return out;
}

// ------------ Core brain ------------

const SYSTEM_PROMPT = `
You are "Adbhutam Brain" – a coding + teaching assistant for one power user.
- Answer in a mix of Telugu + simple English, like the user writes.
- You can:
  • explain any topic clearly
  • design UI structures (HTML/CSS/JS)
  • write and debug code (JS, HTML, CSS, Node, etc.)
  • read attached files/code and find errors, then give clean fixed code.
- When user asks about code/UI, always return final answer inside proper code blocks.
- Be concise but helpful. కొంచెం friendly tone ఉండాలి.
`;

async function runBrain(message, files = []) {
  const fileContext = buildFileContext(files);

  let userContent = message || "";
  if (fileContext) {
    userContent +=
      "\n\n[Attached files for context below. Use them while answering.]\n" +
      fileContext;
  }

  const reply = await callOpenAI([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent }
  ]);

  log("reply", { message, hasFiles: !!files.length });
  return reply;
}

// ------------ Routes ------------

// Health check
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    mode: "Adbhutam Cloud Brain (LLM)",
    logs: brainMemory.logs.length
  });
});

// Main chat
app.post("/api/chat", async (req, res) => {
  const { message = "", files = [] } = req.body || {};

  if (!message && (!files || !files.length)) {
    return res.status(400).json({ error: "message or files missing" });
  }

  log("request", {
    messageSnippet: message.slice(0, 200),
    filesCount: (files || []).length
  });

  try {
    const reply = await runBrain(message, files);
    res.json({ reply });
  } catch (e) {
    console.error("Brain fatal error:", e);
    res
      .status(500)
      .json({ error: "Brain exception", details: e.message || String(e) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Adbhutam Cloud Brain running on port " + PORT);
});
