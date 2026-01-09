/**
 * core/001_understand.js
 *
 * Adbhutam – Understanding Layer (Merged & Correct)
 * -------------------------------------------------
 * Responsibility:
 *  - Normalize input
 *  - Detect language (Telugu / English / Mixed)
 *  - Detect user intent (action + target)
 *  - Measure clarity
 *
 * NO answering
 * NO assumptions
 * This output is the ONLY truth for the pipeline
 */

const Understand = {};

/**
 * Normalize input safely
 */
function normalizeInput(input) {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect language
 */
function detectLanguage(text) {
  if (/[\u0C00-\u0C7F]/.test(text)) {
    if (/[a-zA-Z]/.test(text)) return "mixed";
    return "telugu";
  }
  return "english";
}

/**
 * Detect basic user action intent
 */
function detectAction(text) {
  const t = text.toLowerCase();

  if (/(build|create|generate|make|develop|చేయాలి|తయారు)/.test(t)) {
    return "build";
  }
  if (/(fix|debug|solve|repair|error|సరిచేయి|పొరపాటు)/.test(t)) {
    return "fix";
  }
  if (/(explain|why|how|what is|define|ఎలా|ఏంటి)/.test(t)) {
    return "explain";
  }
  if (/(compare|decide|choose|better)/.test(t)) {
    return "decide";
  }

  return "ask";
}

/**
 * Detect target abstraction
 */
function detectTarget(text) {
  const t = text.toLowerCase();

  if (/\b(code|program|script|function|class)\b/.test(t)) {
    return "code";
  }
  if (/\b(app|application|software|system|tool)\b/.test(t)) {
    return "system";
  }
  if (/\b(architecture|design|structure)\b/.test(t)) {
    return "architecture";
  }
  if (/\b(data|database|file|storage)\b/.test(t)) {
    return "data";
  }

  return "unknown";
}

/**
 * Measure clarity level
 */
function measureClarity(action, target) {
  if (action !== "ask" && target !== "unknown") {
    return "high";
  }
  if (action !== "ask") {
    return "medium";
  }
  return "low";
}

/**
 * MAIN ENTRY
 */
Understand.process = function (rawInput) {
  const text = normalizeInput(rawInput);

  const language = detectLanguage(text);
  const action = detectAction(text);
  const target = detectTarget(text);
  const clarity = measureClarity(action, target);

  return {
    stage: "understand",
    raw: rawInput,
    normalized: text,
    language,
    intent: {
      action,   // build | fix | explain | decide | ask
      target,   // code | system | architecture | data | unknown
      clarity   // high | medium | low
    },
    meta: {
      length: text.length,
      empty: text.length === 0,
      timestamp: Date.now()
    }
  };
};

export default Understand;
