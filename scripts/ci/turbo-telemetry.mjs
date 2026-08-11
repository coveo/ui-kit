/**
 * Pure sanitization logic for Turbo run summaries — extracts only an
 * allowlisted subset of fields into a small, versioned JSON artifact safe to
 * upload from CI.
 *
 * WHY: `turbo run ... --summarize` writes a summary file to `.turbo/runs/`
 * that includes full input-file hashes/paths, ALL configured environment
 * variable NAMES (not values, but still an internal-detail leak), an
 * internal cache salt (`globalCacheInputs.rootKey`), and git SCM info. None
 * of that should leave the runner. This module keeps ONLY what the CI
 * performance dashboard needs: which tasks ran, how long they took, and
 * whether they hit cache — nothing else.
 *
 * SECURITY: this module must never widen its allowlist to pass through
 * unknown/arbitrary fields. Every field on the output shape is explicitly
 * listed below — if Turbo adds a new summary field, it is silently dropped
 * (not accidentally included) until someone deliberately adds it here.
 */

/** Schema version for the sanitized artifact — bump on any breaking shape change. */
export const TELEMETRY_SCHEMA_VERSION = 1;

/**
 * @typedef {object} SanitizedTaskTelemetry
 * @property {string} taskId - e.g. "@coveo/atomic#test"
 * @property {string} task - e.g. "test"
 * @property {string} package - e.g. "@coveo/atomic"
 * @property {'HIT'|'MISS'} cacheStatus
 * @property {number} durationMs - execution.endTime - execution.startTime; 0 for a full cache hit that didn't execute.
 * @property {number} exitCode
 */

/**
 * @typedef {object} SanitizedTelemetry
 * @property {number} schemaVersion
 * @property {string[]} affectedPackages - data.packages, as reported by Turbo for this run.
 * @property {number} totalTasks
 * @property {number} cacheHits
 * @property {number} cacheMisses
 * @property {number} totalDurationMs - execution.endTime - execution.startTime for the whole run.
 * @property {number} exitCode - the run's overall execution.exitCode.
 * @property {SanitizedTaskTelemetry[]} tasks
 */

/**
 * @param {unknown} rawSummary - Parsed JSON from a `.turbo/runs/*.json` file.
 * @returns {SanitizedTelemetry}
 * @throws {Error} if rawSummary is missing required fields — callers should
 *   treat a thrown error as "could not produce telemetry this run" and
 *   continue without failing the CI job (see cli.mjs).
 */
export function sanitizeTurboSummary(rawSummary) {
  if (typeof rawSummary !== 'object' || rawSummary === null) {
    throw new Error('Turbo summary is not an object');
  }

  const summary = /** @type {Record<string, unknown>} */ (rawSummary);
  const execution = /** @type {Record<string, unknown> | undefined} */ (summary.execution);
  if (typeof execution !== 'object' || execution === null) {
    throw new Error('Turbo summary is missing the top-level "execution" field');
  }
  if (!Array.isArray(summary.tasks)) {
    throw new Error('Turbo summary is missing the "tasks" array');
  }
  if (!Array.isArray(summary.packages)) {
    throw new Error('Turbo summary is missing the "packages" array');
  }

  const startTime = asFiniteNumber(execution.startTime);
  const endTime = asFiniteNumber(execution.endTime);
  const totalDurationMs =
    startTime != null && endTime != null ? Math.max(0, endTime - startTime) : 0;

  const tasks = summary.tasks
    .filter((task) => typeof task === 'object' && task !== null)
    .map((task) => sanitizeTask(/** @type {Record<string, unknown>} */ (task)));

  const cacheHits = tasks.filter((t) => t.cacheStatus === 'HIT').length;
  const cacheMisses = tasks.length - cacheHits;

  return {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    affectedPackages: summary.packages.filter((p) => typeof p === 'string'),
    totalTasks: tasks.length,
    cacheHits,
    cacheMisses,
    totalDurationMs,
    exitCode: asFiniteNumber(execution.exitCode) ?? 1,
    tasks,
  };
}

/** @param {Record<string, unknown>} task */
function sanitizeTask(task) {
  const cache = /** @type {Record<string, unknown> | undefined} */ (task.cache);
  const taskExecution = /** @type {Record<string, unknown> | undefined} */ (task.execution);

  const status = typeof cache?.status === 'string' ? cache.status : 'MISS';
  const cacheStatus = status === 'HIT' ? 'HIT' : 'MISS';

  const startTime = asFiniteNumber(taskExecution?.startTime);
  const endTime = asFiniteNumber(taskExecution?.endTime);
  const durationMs = startTime != null && endTime != null ? Math.max(0, endTime - startTime) : 0;

  return {
    taskId: typeof task.taskId === 'string' ? task.taskId : 'unknown',
    task: typeof task.task === 'string' ? task.task : 'unknown',
    package: typeof task.package === 'string' ? task.package : 'unknown',
    cacheStatus,
    durationMs,
    exitCode: asFiniteNumber(taskExecution?.exitCode) ?? 0,
  };
}

/** @param {unknown} value @returns {number | null} */
function asFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
