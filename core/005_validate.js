/**
 * core/005_validate.js
 *
 * Adbhutam – Validation Layer
 * --------------------------
 * Responsibility:
 *  - Inspect execution results
 *  - Detect failures / inconsistencies
 *  - Decide trustworthiness
 *  - NO execution
 *  - NO answering
 */

const Validate = {};

/**
 * Analyze execution logs
 */
function analyzeLogs(execution) {
  const issues = [];
  const warnings = [];

  if (!execution || !Array.isArray(execution.logs)) {
    issues.push("Execution logs missing or invalid.");
    return { issues, warnings };
  }

  execution.logs.forEach((log) => {
    if (log.status === "failed") {
      issues.push(
        `Step ${log.step_id} failed: ${log.error || "unknown error"}`
      );
    }
  });

  return { issues, warnings };
}

/**
 * MAIN ENTRY
 */
Validate.process = function (executeResult) {
  if (!executeResult || executeResult.stage !== "execute") {
    return {
      stage: "validate",
      status: "error",
      reason: "Invalid input to validation layer",
      trusted: false,
      next: "halt"
    };
  }

  const execution = executeResult.execution;

  const { issues, warnings } = analyzeLogs(execution);

  // Critical failure
  if (issues.length > 0) {
    return {
      stage: "validate",
      status: "failed",
      trusted: false,
      issues,
      warnings,
      next: "inspect_and_fix"
    };
  }

  // No issues
  return {
    stage: "validate",
    status: "passed",
    trusted: true,
    issues: [],
    warnings,
    next: "finalize"
  };
};

export default Validate;
