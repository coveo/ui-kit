import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {callWithRetry} from './request-retry.js';

type Result =
  | {success: true}
  | {success: false; conflict?: object; status?: number; transient?: true};

const success: Result = {success: true};
const failure: Result = {success: false};
const conflict = (): Result => ({success: false, conflict: {}});
const transient = (status?: number): Result => ({success: false, status, transient: true});

describe('callWithRetry', () => {
  let attempt: ReturnType<typeof vi.fn<() => Promise<Result>>>;
  let controller: AbortController;

  beforeEach(() => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
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

    await expect(callWithRetry(attempt, controller.signal)).resolves.toBe(success);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('returns a failure that is not a conflict without retrying', async () => {
    respondWith(failure);

    await expect(callWithRetry(attempt, controller.signal)).resolves.toBe(failure);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('doubles the wait from 250 ms and caps it at 4 s', async () => {
    respondWith(conflict(), conflict(), conflict(), conflict(), conflict(), conflict(), success);

    const result = callWithRetry(attempt, controller.signal);

    expect(await attemptsAfter(0, 249, 1, 500, 1000, 2000, 3999, 1, 4000)).toEqual([
      1, 1, 2, 3, 4, 5, 5, 6, 7,
    ]);
    await expect(result).resolves.toBe(success);
  });

  it('jitters each backoff wait by up to 20% either way', async () => {
    vi.mocked(Math.random).mockReturnValue(0);
    respondWith(conflict(), success);

    const result = callWithRetry(attempt, controller.signal);

    expect(await attemptsAfter(199, 1)).toEqual([1, 2]);
    await expect(result).resolves.toBe(success);
  });

  it('shortens the last wait to what is left of 30 s, then returns the last conflict', async () => {
    // 10 waits take 27.75 s; the 11th is cut to the 2.25 s left.
    const conflicts = Array.from({length: 12}, () => conflict());
    respondWith(...conflicts);

    const result = callWithRetry(attempt, controller.signal);

    expect(await attemptsAfter(27_750, 2249, 1, 30_000)).toEqual([11, 11, 12, 12]);
    await expect(result).resolves.toBe(conflicts[11]);
  });

  it('counts the time spent on each attempt against the budget', async () => {
    attempt.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(conflict()), 2000))
    );

    const result = callWithRetry(attempt, controller.signal);
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(result).resolves.toMatchObject({success: false});
    // Attempts start at 0, 2.25, 4.75, 7.75, 11.75, 17.75, 23.75 and 29.75 s.
    expect(attempt).toHaveBeenCalledTimes(8);
  });

  it('rejects with an AbortError, without another attempt, when aborted during a wait', async () => {
    respondWith(conflict());

    const result = callWithRetry(attempt, controller.signal);
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

    await expect(callWithRetry(attempt, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  describe('with transient retries', () => {
    let onRetry: ReturnType<typeof vi.fn<() => void>>;
    const call = () => callWithRetry(attempt, controller.signal, {transient: {onRetry}});

    beforeEach(() => {
      onRetry = vi.fn<() => void>();
    });

    it.each([
      [
        'a transient failure without the option',
        transient(),
        () => callWithRetry(attempt, controller.signal),
      ],
      ['a failure that is not transient', failure, call],
    ])('does not retry %s', async (_label, failed, run) => {
      respondWith(failed);

      await expect(run()).resolves.toBe(failed);
      expect(attempt).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
    });

    it('retries after 500 ms, then 1 s, calling onRetry before each wait, for 3 attempts at most', async () => {
      const failures = [transient(), transient(), transient(), transient()];
      respondWith(...failures);

      const result = call();

      expect(await attemptsAfter(0, 499, 1, 999, 1, 10_000)).toEqual([1, 1, 2, 2, 3, 3]);
      await expect(result).resolves.toBe(failures[2]);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('starts the backoff of a 429 at 1 s, then 2 s', async () => {
      respondWith(transient(429), transient(429), success);

      const result = call();

      expect(await attemptsAfter(999, 1, 1999, 1)).toEqual([1, 2, 2, 3]);
      await expect(result).resolves.toBe(success);
    });

    it('counts the time spent on each attempt against the budget', async () => {
      attempt.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(transient()), 4000))
      );

      const result = call();
      await vi.advanceTimersByTimeAsync(20_000);

      await expect(result).resolves.toMatchObject({success: false});
      // The second attempt starts at 4.5 s; its next wait would end past 5 s.
      expect(attempt).toHaveBeenCalledTimes(2);
    });

    it('keeps the conflict backoff and budget alongside transient retries', async () => {
      respondWith(conflict(), transient(), conflict(), success);

      const result = call();

      // Conflict waits 250 ms, the transient failure 500 ms, then the second conflict 500 ms.
      expect(await attemptsAfter(0, 250, 500, 500)).toEqual([1, 2, 3, 4]);
      await expect(result).resolves.toBe(success);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
