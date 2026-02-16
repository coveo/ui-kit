import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {promiseTimeout} from './promise-utils';

describe('promise-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('#promiseTimeout', () => {
    it('should resolve when promise resolves before timeout', async () => {
      const fastPromise = Promise.resolve('success');

      const result = promiseTimeout(fastPromise, 1000);

      await expect(result).resolves.toBe('success');
    });

    it('should resolve when non-promise value is provided', async () => {
      const value = 'immediate value';

      const result = promiseTimeout(value, 1000);

      await expect(result).resolves.toBe('immediate value');
    });

    it('should reject with timeout error when promise takes too long', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 2000);
      });

      const result = promiseTimeout(slowPromise, 1000);

      // Advance time past timeout
      vi.advanceTimersByTime(1000);

      await expect(result).rejects.toThrow('Promise timed out.');
    });

    it('should clear timeout when promise resolves in time', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const fastPromise = Promise.resolve('quick');

      const result = promiseTimeout(fastPromise, 1000);

      await expect(result).resolves.toBe('quick');
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should handle promise rejection before timeout', async () => {
      const rejectedPromise = Promise.reject(new Error('Promise failed'));

      const result = promiseTimeout(rejectedPromise, 1000);

      await expect(result).rejects.toThrow('Promise failed');
    });

    it('should handle zero timeout', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed'), 100);
      });

      const result = promiseTimeout(promise, 0);

      // Advance time to trigger immediate timeout
      vi.advanceTimersByTime(0);

      await expect(result).rejects.toThrow('Promise timed out.');
    });

    it('should handle negative timeout', async () => {
      const promise = Promise.resolve('immediate');

      const result = promiseTimeout(promise, -100);

      // Negative timeout should still create a timeout that fires immediately
      vi.advanceTimersByTime(0);

      // Promise microtask resolves before the timer fires
      await expect(result).resolves.toBe('immediate');
    });

    it('should handle very large timeout values', async () => {
      const promise = Promise.resolve('quick');

      const result = promiseTimeout(promise, Number.MAX_SAFE_INTEGER);

      await expect(result).resolves.toBe('quick');
    });

    it('should handle multiple concurrent timeouts', async () => {
      const promise1 = new Promise((resolve) =>
        setTimeout(() => resolve('p1'), 500)
      );
      const promise2 = new Promise((resolve) =>
        setTimeout(() => resolve('p2'), 1500)
      );
      const promise3 = new Promise((resolve) =>
        setTimeout(() => resolve('p3'), 800)
      );

      const result1 = promiseTimeout(promise1, 1000);
      const result2 = promiseTimeout(promise2, 1000);
      const result3 = promiseTimeout(promise3, 1000);

      // Advance time to 500ms - promise1 should resolve
      vi.advanceTimersByTime(500);
      await expect(result1).resolves.toBe('p1');

      // Advance time to 1000ms total - promise2 should timeout, promise3 should resolve
      vi.advanceTimersByTime(500);
      await expect(result2).rejects.toThrow('Promise timed out.');
      await expect(result3).resolves.toBe('p3');
    });

    it('should handle promise that resolves exactly at timeout', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('on time'), 1000);
      });

      const result = promiseTimeout(promise, 1000);

      vi.advanceTimersByTime(1000);

      // The original promise resolves first because its timer was registered earlier
      await expect(result).resolves.toBe('on time');
    });

    it('should work with async/await pattern', async () => {
      const asyncFunction = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return 'async result';
      };

      const result = promiseTimeout(asyncFunction(), 1000);

      vi.advanceTimersByTime(500);

      await expect(result).resolves.toBe('async result');
    });

    it('should handle promises that throw synchronously', async () => {
      const throwingPromise = Promise.resolve().then(() => {
        throw new Error('Synchronous error');
      });

      const result = promiseTimeout(throwingPromise, 1000);

      await expect(result).rejects.toThrow('Synchronous error');
    });

    it('should properly clean up timeout IDs', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const promise = Promise.resolve('success');

      await promiseTimeout(promise, 1000);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      const timeoutId = setTimeoutSpy.mock.results[0].value;
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });

    it('should handle different promise types', async () => {
      const stringPromise = Promise.resolve('string value');
      const numberPromise = Promise.resolve(42);
      const objectPromise = Promise.resolve({key: 'value'});
      const arrayPromise = Promise.resolve([1, 2, 3]);
      const nullPromise = Promise.resolve(null);
      const undefinedPromise = Promise.resolve(undefined);

      await expect(promiseTimeout(stringPromise, 1000)).resolves.toBe(
        'string value'
      );
      await expect(promiseTimeout(numberPromise, 1000)).resolves.toBe(42);
      await expect(promiseTimeout(objectPromise, 1000)).resolves.toEqual({
        key: 'value',
      });
      await expect(promiseTimeout(arrayPromise, 1000)).resolves.toEqual([
        1, 2, 3,
      ]);
      await expect(promiseTimeout(nullPromise, 1000)).resolves.toBeNull();
      await expect(
        promiseTimeout(undefinedPromise, 1000)
      ).resolves.toBeUndefined();
    });
  });
});
