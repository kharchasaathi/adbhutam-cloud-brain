/**
 * core/002_decide.js
 *
 * Adbhutam – Decision Layer
 * ------------------------
 * Responsibility:
 *  - Decide what the system should do NEXT
 *  - Based purely on understanding output
 *  - NO answering
 *  - NO execution
 */

const Decide = {};

/**
 * Core decision logic
 */
Decide.process = function (understandResult) {
  if (!understandResult || understandResult.stage !== "understand") {
    return {
      stage: "decide",
      status: "error",
      reason: "Invalid input to decision layer",
      next: "halt"
    };
  }

  const { intent, meta } = understandResult;

  // Empty input guard
  if (meta.empty) {
    return {
      stage: "decide",
      status: "need_input",
      reason: "No input provided",
      next: "await_input"
    };
  }

  // Low clarity → ask clarification
  if (intent.clarity === "low") {
    return {
      stage: "decide",
      status: "need_clarification",
      reason: "Request is too vague",
      next: "clarify"
    };
  }

  // Medium clarity → partial proceed
  if (intent.clarity === "medium") {
    return {
      stage: "decide",
      status: "partial",
      reason: "Request partially understood",
      next: "clarify_then_plan"
    };
  }

  // High clarity → proceed to planning
  if (intent.clarity === "high") {
    return {
      stage: "decide",
      status: "proceed",
      reason: "Request clear enough to proceed",
      next: "plan"
    };
  }

  // Fallback (should never hit)
  return {
    stage: "decide",
    status: "cannot_decide",
    reason: "Unhandled decision state",
    next: "halt"
  };
};

export default Decide;
