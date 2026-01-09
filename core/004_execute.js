/**
 * core/004_execute.js
 *
 * Adbhutam – Execution Controller
 * -------------------------------
 * Responsibility:
 *  - Control execution flow based on plan
 *  - Track execution state
 *  - Call engines (stub for now)
 *  - NO final answers
 *  - NO direct code generation
 */

const Execute = {};

/**
 * Create execution context
 */
function createExecutionContext(plan) {
  return {
    execution_id: "exec_" + Date.now(),
    current_step: 0,
    completed_steps: [],
    halted: false,
    logs: [],
    plan_snapshot: plan
  };
}

/**
 * Execute a single step (stub)
 */
function executeStep(step, context) {
  // For now: only log execution
  context.logs.push({
    step_id: step.id,
    action: step.action,
    status: "executed_stub",
    timestamp: Date.now()
  });

  context.completed_steps.push(step.id);
}

/**
 * MAIN ENTRY
 */
Execute.process = function (planResult) {
  if (!planResult || planResult.stage !== "plan") {
    return {
      stage: "execute",
      status: "error",
      reason: "Invalid input to execution layer",
      next: "halt"
    };
  }

  if (planResult.status !== "ready") {
    return {
      stage: "execute",
      status: "blocked",
      reason: "Plan is not ready for execution",
      next: "halt"
    };
  }

  const plan = planResult.plan;
  const context = createExecutionContext(plan);

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];

    if (context.halted) break;

    context.current_step = step.id;

    try {
      executeStep(step, context);
    } catch (err) {
      context.halted = true;
      context.logs.push({
        step_id: step.id,
        error: err.message || String(err),
        status: "failed"
      });
    }
  }

  return {
    stage: "execute",
    status: context.halted ? "halted" : "completed",
    execution: context,
    next: context.halted ? "inspect_error" : "validate"
  };
};

export default Execute;
