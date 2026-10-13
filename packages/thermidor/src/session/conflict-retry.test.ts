import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {callWithConflictRetry} from './conflict-retry.js';

type Result = {success: true} | {success: false; conflict?: {retryAfterMs?: number}};

const success: Result = {success: true};
const failure: Result = {success: false};
const conflict = (retryAfterMs?: number): Result => ({
  success: false,
  conflict: retryAfterMs === undefined ? {} : {retryAfterMs},
});

describe('callWithConflictRetry', () => {
  let attempt: ReturnType<typeof vi.fn<() => Promise<Result>>>;
  let controller: AbortController;

  beforeEach(() => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    attempt = vi.fn<() => Promise<Result>>();
    controller = new AbortController();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function respondWith(...results: Result[]): void {
    for (const result of results) {
      attempt.mockResolvedValueOnce(result);
    }
  }

  /** Attempts made after each of `waits` elapses, one wait at a time. */
  async function attemptsAfter(...waits: number[]): Promise<number[]> {
    const counts: number[] = [];
    for (const wait of waits) {
      await vi.advanceTimersByTimeAsync(wait);
      counts.push(attempt.mock.calls.length);
    }
    return counts;
  }

  it('returns a success without retrying', async () => {
    respondWith(success);

    await expect(callWithConflictRetry(attempt, controller.signal)).resolves.toBe(success);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('returns a failure that is not a conflict without retrying', async () => {
    respondWith(failure);

    await expect(callWithConflictRetry(attempt, controller.signal)).resolves.toBe(failure);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('doubles the wait from 250 ms and caps it at 4 s', async () => {
    respondWith(conflict(), conflict(), conflict(), conflict(), conflict(), conflict(), success);

    const result = callWithConflictRetry(attempt, controller.signal);

    expect(await attemptsAfter(0, 249, 1, 500, 1000, 2000, 3999, 1, 4000)).toEqual([
      1, 1, 2, 3, 4, 5, 5, 6, 7,
    ]);
    await expect(result).resolves.toBe(success);
  });

  it('jitters each backoff wait by up to 20% either way', async () => {
    vi.mocked(Math.random).mockReturnValue(0);
    respondWith(conflict(), success);

    const result = callWithConflictRetry(attempt, controller.signal);

    expect(await attemptsAfter(199, 1)).toEqual([1, 2]);
    await expect(result).resolves.toBe(success);
  });

  it('returns the last conflict once the next wait would overrun 30 s', async () => {
    // 10 waits fit the budget (27.75 s); an 11th would overrun it.
    const conflicts = Array.from({length: 11}, () => conflict());
    respondWith(...conflicts);

    const result = callWithConflictRetry(attempt, controller.signal);
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(result).resolves.toBe(conflicts[10]);
    expect(attempt).toHaveBeenCalledTimes(11);
  });

  it('waits as long as Retry-After asks, up to 4 s', async () => {
    respondWith(conflict(2000), conflict(60_000), success);

    const result = callWithConflictRetry(attempt, controller.signal);

    expect(await attemptsAfter(1999, 1, 3999, 1)).toEqual([1, 2, 2, 3]);
    await expect(result).resolves.toBe(success);
  });

  it('rejects with an AbortError, without another attempt, when aborted during a wait', async () => {
    respondWith(conflict());

    const result = callWithConflictRetry(attempt, controller.signal);
    const settled = expect(result).rejects.toMatchObject({name: 'AbortError'});
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();

    await settled;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('rejects with an AbortError when the signal is already aborted at the first wait', async () => {
    controller.abort();
    respondWith(conflict());

    await expect(callWithConflictRetry(attempt, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });
});
