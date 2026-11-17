import type {
  ActionInFlightConflict,
  TransientFailure,
} from '@/src/internal/api/protocol/error-handling.js';

// Long enough for an aborted agent run to wind down: the Gateway can't cancel it upstream, so it
// keeps the session's slot until the run's next event or its end.
const CONFLICT_RETRY_BUDGET_MS = 30_000;
const MAX_CONFLICT_DELAY_MS = 4_000;
const CONFLICT_BASE_DELAY_MS = 250;

// Short enough that a page waiting on `initialize` gives up soon on an endpoint that is down.
const TRANSIENT_RETRY_BUDGET_MS = 5_000;
const MAX_TRANSIENT_ATTEMPTS = 3;
const TRANSIENT_BASE_DELAY_MS = 500;

interface AttemptResult {
  success: boolean;
  conflict?: ActionInFlightConflict;
  transient?: TransientFailure;
}

export interface RetryOptions {
  /**
   * Also retries a transient failure (a network error, a `429`, `502`, `503` or `504`), at most
   * {@link MAX_TRANSIENT_ATTEMPTS} attempts within {@link TRANSIENT_RETRY_BUDGET_MS}.
   */
  transient?: {
    /** Called before each wait for a transient retry. */
    onRetry?: () => void;
  };
}

/**
 * Repeats `attempt` while it fails with an in-flight conflict, until the time budget (attempts
 * included) runs out, and resolves with the last result. With `options.transient`, it also repeats
 * a transient failure within its own, shorter budget. Rejects with an `AbortError` when `signal`
 * aborts during a wait.
 */
export async function callWithRetry<TResult extends AttemptResult>(
  attempt: () => Promise<TResult>,
  signal: AbortSignal,
  options: RetryOptions = {}
): Promise<TResult> {
  const start = Date.now();
  const conflictDeadline = start + CONFLICT_RETRY_BUDGET_MS;
  const transientDeadline = start + TRANSIENT_RETRY_BUDGET_MS;
  let conflictRetries = 0;
  let transientAttempts = 1;
  for (;;) {
    const result = await attempt();
    if (result.success) {
      return result;
    }
    if (result.conflict) {
      const remaining = conflictDeadline - Date.now();
      if (remaining <= 0) {
        return result;
      }
      await waitFor(Math.min(conflictDelay(conflictRetries++), remaining), signal);
      continue;
    }
    if (!options.transient || !result.transient || transientAttempts >= MAX_TRANSIENT_ATTEMPTS) {
      return result;
    }
    const delay = transientDelay(transientAttempts - 1, result.transient);
    if (delay > transientDeadline - Date.now()) {
      return result;
    }
    transientAttempts++;
    options.transient.onRetry?.();
    await waitFor(delay, signal);
  }
}

function conflictDelay(retry: number): number {
  return Math.min(CONFLICT_BASE_DELAY_MS * 2 ** retry * jitter(), MAX_CONFLICT_DELAY_MS);
}

// A `429` waits at least as long as its `Retry-After` asks.
function transientDelay(retry: number, failure: TransientFailure): number {
  return Math.max(TRANSIENT_BASE_DELAY_MS * 2 ** retry * jitter(), failure.retryAfterMs ?? 0);
}

function jitter(): number {
  return 0.8 + Math.random() * 0.4;
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
