import type {ActionInFlightConflict} from '@/src/internal/api/protocol/error-handling.js';

// Long enough for an aborted agent run to wind down: the Gateway can't cancel it upstream, so it
// keeps the session's slot until the run's next event or its end.
const CONFLICT_RETRY_BUDGET_MS = 30_000;
const MAX_CONFLICT_DELAY_MS = 4_000;
const CONFLICT_BASE_DELAY_MS = 250;

interface AttemptResult {
  success: boolean;
  conflict?: ActionInFlightConflict;
}

/**
 * Repeats `attempt` while it fails with an in-flight conflict, until the time budget (attempts
 * included) runs out, and resolves with the last result. Rejects with an `AbortError` when
 * `signal` aborts during a wait.
 */
export async function callWithConflictRetry<TResult extends AttemptResult>(
  attempt: () => Promise<TResult>,
  signal: AbortSignal
): Promise<TResult> {
  const deadline = Date.now() + CONFLICT_RETRY_BUDGET_MS;
  for (let retry = 0; ; retry++) {
    const result = await attempt();
    if (result.success || !result.conflict) {
      return result;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      return result;
    }
    await waitFor(Math.min(conflictDelay(retry, result.conflict.retryAfterMs), remaining), signal);
  }
}

function conflictDelay(retry: number, retryAfterMs: number | undefined): number {
  const jitter = 0.8 + Math.random() * 0.4;
  // A zero wait would never use up the budget, so it falls back to the backoff.
  const delay =
    retryAfterMs !== undefined && retryAfterMs > 0
      ? retryAfterMs
      : CONFLICT_BASE_DELAY_MS * 2 ** retry * jitter;
  return Math.min(delay, MAX_CONFLICT_DELAY_MS);
}

// Rejects with an `AbortError`, so an aborted wait ends like an aborted request.
function waitFor(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      const error = new Error('Aborted');
      error.name = 'AbortError';
      reject(error);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, {once: true});
  });
}
