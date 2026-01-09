/**
 * core/003_plan.js
 *
 * Adbhutam – Planning Layer
 * ------------------------
 * Responsibility:
 *  - Convert decision into a structured execution plan
 *  - Break work into ordered steps
 *  - Identify unknowns / risks
 *  - NO execution
 *  - NO answering
 */

const Plan = {};

/**
 * Create a generic plan skeleton
 */
function createBasePlan() {
  return {
    plan_id: "plan_" + Date.now(),
    steps: [],
    requires_clarification: false,
    clarifications: [],
    risks: [],
    notes: []
  };
}

/**
 * MAIN ENTRY
 */
Plan.process = function (decideResult, understandResult) {
  // Basic validation
  if (!decideResult || decideResult.stage !== "decide") {
    return {
      stage: "plan",
      status: "error",
      reason: "Invalid input to planning layer",
      next: "halt"
    };
  }

  const plan = createBasePlan();

  // Handle decision outcomes
  if (decideResult.status === "need_clarification") {
    plan.requires_clarification = true;
    plan.clarifications.push("Please provide more details.");
    return {
      stage: "plan",
      status: "blocked",
      reason: "Clarification required before planning",
      plan
    };
  }

  if (decideResult.status === "partial") {
    plan.requires_clarification = true;
    plan.clarifications.push(
      "Some aspects are unclear. Specify scope, constraints, or target."
    );
  }

  if (decideResult.status !== "proceed" && decideResult.status !== "partial") {
    return {
      stage: "plan",
      status: "cannot_plan",
      reason: decideResult.reason || "Planning not allowed",
      plan
    };
  }

  // High-level generic steps (UNIVERSAL)
  plan.steps.push(
    { id: 1, action: "analyze_requirements", description: "Understand full requirements and constraints" },
    { id: 2, action: "design_architecture", description: "Create high-level architecture" },
    { id: 3, action: "decompose_modules", description: "Break system into modules/components" },
    { id: 4, action: "select_technologies", description: "Choose languages/tools based on constraints" },
    { id: 5, action: "implement_modules", description: "Implement modules incrementally" },
    { id: 6, action: "validate_and_test", description: "Validate correctness and run tests" },
    { id: 7, action: "integrate_and_finalize", description: "Integrate modules and finalize output" }
  );

  // Risk detection (very basic, expanded later)
  if (understandResult && understandResult.intent) {
    if (understandResult.intent.target === "unknown") {
      plan.risks.push("Target is not clearly defined.");
    }
    if (understandResult.intent.clarity !== "high") {
      plan.risks.push("Incomplete clarity may cause rework.");
    }
  }

  plan.notes.push("This is a high-level plan. Execution happens in later stages.");

  return {
    stage: "plan",
    status: "ready",
    next: "execute",
    plan
  };
};

export default Plan;
