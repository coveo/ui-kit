import type {ActionInFlightConflict} from '@/src/internal/api/protocol/error-handling.js';

// Long enough for an aborted agent run to wind down: the Gateway can't cancel it upstream, so it
// keeps the session's slot until the run's next event or its end.
// TODO(KIT-6261): lower once the Gateway aborts the run, and frees the slot, on client disconnect.
const MAX_CONFLICT_WAIT_MS = 30_000;
const MAX_CONFLICT_DELAY_MS = 4_000;
const CONFLICT_BASE_DELAY_MS = 250;

interface AttemptResult {
  success: boolean;
  conflict?: ActionInFlightConflict;
}

/**
 * Repeats `attempt` while it fails with an in-flight conflict, until the wait budget runs out, and
 * resolves with the last result. Rejects with an `AbortError` when `signal` aborts during a wait.
 */
export async function callWithConflictRetry<TResult extends AttemptResult>(
  attempt: () => Promise<TResult>,
  signal: AbortSignal
): Promise<TResult> {
  let waited = 0;
  for (let retry = 0; ; retry++) {
    const result = await attempt();
    if (result.success || !result.conflict) {
      return result;
    }
    const delay = conflictDelay(retry, result.conflict.retryAfterMs);
    if (waited + delay > MAX_CONFLICT_WAIT_MS) {
      return result;
    }
    waited += delay;
    await waitFor(delay, signal);
  }
}

// TODO(KIT-6255): once actions carry a sequence number, wait for `inFlightSequence` to be answered
// rather than backing off blind.
function conflictDelay(retry: number, retryAfterMs: number | undefined): number {
  const jitter = 0.8 + Math.random() * 0.4;
  const delay = retryAfterMs ?? CONFLICT_BASE_DELAY_MS * 2 ** retry * jitter;
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
