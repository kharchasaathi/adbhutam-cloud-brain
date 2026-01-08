/**
 * Adbhutam Brain Core – UNIVERSAL STAGE 1
 * Understanding + Decision
 * Domain-agnostic, no fake AI, no hardcoding
 */

const BrainCore = {};

/**
 * ===============================
 * 1️⃣ UNDERSTANDING LAYER
 * ===============================
 * Converts raw human message → structured intent
 */
BrainCore.understand = function (message = "") {
  const text = String(message).toLowerCase().trim();

  const intent = {
    raw: message,
    action: "unknown",     // ask | build | fix | explain | decide
    object: "unknown",     // code | system | idea | data | unknown
    clarity: "low"         // low | medium | high
  };

  if (!text) return intent;

  // ---- ACTION detection (WHAT user wants to do) ----
  if (
    text.includes("build") ||
    text.includes("create") ||
    text.includes("generate") ||
    text.includes("make")
  ) {
    intent.action = "build";
  } else if (
    text.includes("fix") ||
    text.includes("solve") ||
    text.includes("debug") ||
    text.includes("error")
  ) {
    intent.action = "fix";
  } else if (
    text.includes("explain") ||
    text.includes("what is") ||
    text.includes("define") ||
    text.includes("why")
  ) {
    intent.action = "explain";
  } else if (
    text.includes("should") ||
    text.includes("decide") ||
    text.includes("which is better")
  ) {
    intent.action = "decide";
  } else {
    intent.action = "ask";
  }

  // ---- OBJECT detection (WHAT it is about) ----
  if (
    text.includes("code") ||
    text.includes("program") ||
    text.includes("script") ||
    text.includes("function")
  ) {
    intent.object = "code";
  } else if (
    text.includes("system") ||
    text.includes("tool") ||
    text.includes("software") ||
    text.includes("app")
  ) {
    intent.object = "system";
  } else if (
    text.includes("data") ||
    text.includes("file") ||
    text.includes("database")
  ) {
    intent.object = "data";
  } else {
    intent.object = "unknown";
  }

  // ---- CLARITY ----
  if (intent.action !== "unknown" && intent.object !== "unknown") {
    intent.clarity = "high";
  } else if (intent.action !== "unknown") {
    intent.clarity = "medium";
  }

  return intent;
};

/**
 * ===============================
 * 2️⃣ DECISION LAYER
 * ===============================
 * Decides WHAT the system can do next
 */
BrainCore.decide = function (intent) {
  const decision = {
    status: "cannot",      // can_execute | need_clarification | cannot
    reason: "",
    next: null
  };

  if (!intent || intent.clarity === "low") {
    decision.status = "need_clarification";
    decision.reason = "Request is too vague. Need more details.";
    decision.next = "clarify";
    return decision;
  }

  // --- BUILD / FIX ---
  if (intent.action === "build" || intent.action === "fix") {
    decision.status = "can_execute";
    decision.next = "execution_layer";
    return decision;
  }

  // --- EXPLAIN / DECIDE ---
  if (intent.action === "explain" || intent.action === "decide") {
    decision.status = "can_execute";
    decision.next = "reasoning_layer";
    return decision;
  }

  // --- GENERAL QUESTIONS ---
  if (intent.action === "ask") {
    decision.status = "can_execute";
    decision.next = "analysis_layer";
    return decision;
  }

  decision.reason = "Action not supported yet.";
  return decision;
};

/**
 * ===============================
 * 3️⃣ MASTER ENTRY
 * ===============================
 * Single entry used by server
 */
BrainCore.process = function (message) {
  const intent = BrainCore.understand(message);
  const decision = BrainCore.decide(intent);

  return {
    intent,
    decision
  };
};

module.exports = BrainCore;
