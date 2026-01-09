/**
 * core/006_finalize.js
 *
 * Adbhutam – Finalization Layer
 * ----------------------------
 * Responsibility:
 *  - Convert validation result into user-facing output
 *  - Hide internal execution details
 *  - Communicate status honestly
 *  - NO guessing
 *  - NO auto answers
 */

const Finalize = {};

/**
 * MAIN ENTRY
 */
Finalize.process = function (validateResult) {
  if (!validateResult || validateResult.stage !== "validate") {
    return {
      stage: "finalize",
      status: "error",
      message: "Invalid system state. Cannot finalize output.",
      next: "halt"
    };
  }

  // Validation failed → honest failure
  if (validateResult.status === "failed") {
    return {
      stage: "finalize",
      status: "failed",
      trusted: false,
      summary: "Execution failed validation.",
      issues: validateResult.issues || [],
      next: "inspect_and_fix"
    };
  }

  // Validation passed → safe success
  if (validateResult.status === "passed") {
    return {
      stage: "finalize",
      status: "success",
      trusted: true,
      summary: "Plan executed and validated successfully.",
      next: "ready_for_next_step"
    };
  }

  // Unexpected state
  return {
    stage: "finalize",
    status: "unknown",
    trusted: false,
    summary: "Unknown validation outcome.",
    next: "halt"
  };
};

export default Finalize;
