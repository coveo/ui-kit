import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {buildDebouncedQueue, type DebouncedQueue} from './debounce-utils';

describe('buildDebouncedQueue', () => {
  let queue: DebouncedQueue;
  const delay = 5;

  beforeEach(() => {
    vi.useFakeTimers();
    queue = buildDebouncedQueue({delay});
  });

  afterEach(() => {
    queue.clear();
  });

  it('executes the first action synchronously', () => {
    const action = vi.fn();
    queue.enqueue(action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("doesn't execute actions more than once", () => {
    const action = vi.fn();
    queue.enqueue(action);
    vi.runAllTimers();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('debounces actions by the given delay', () => {
    const action = vi.fn();
    queue.enqueue(() => {});
    queue.enqueue(action);
    vi.advanceTimersByTime(delay - 1);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('debounces actions executed after the last action within the delay', () => {
    queue.enqueue(() => {}); // Finishes at 0
    queue.enqueue(() => {}); // Finishes at `delay`
    vi.advanceTimersByTime(delay * 2 - 1);
    const action = vi.fn();
    queue.enqueue(action);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("doesn't debounce actions executed after the last action past the delay", () => {
    queue.enqueue(() => {}); // Finishes at 0
    queue.enqueue(() => {}); // Finishes at `delay`
    vi.advanceTimersByTime(delay * 2);
    const action = vi.fn();
    queue.enqueue(action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('overwrites past actions with the same id', () => {
    const completedActions: string[] = [];
    function enqueue(id: string) {
      queue.enqueue(() => completedActions.push(id), id);
    }

    queue.enqueue(() => {});
    enqueue('A');
    enqueue('B');
    enqueue('C');
    enqueue('B');
    enqueue('A');
    vi.runAllTimers();
    expect(completedActions).toEqual(['C', 'B', 'A']);
  });

  it('can remove an action', () => {
    const completedActions: string[] = [];
    function enqueue(id: string) {
      queue.enqueue(() => completedActions.push(id), id);
    }

    queue.enqueue(() => {});
    enqueue('A');
    enqueue('B');
    enqueue('C');
    queue.cancelActionIfQueued('B');
    queue.cancelActionIfQueued('D');
    vi.runAllTimers();
    expect(completedActions).toEqual(['A', 'C']);
  });

  it('can clear the queue', () => {
    const actionA = vi.fn();
    const actionB = vi.fn();
    queue.enqueue(() => {});
    queue.enqueue(actionA);
    queue.enqueue(actionB);
    queue.clear();
    vi.runAllTimers();
    expect(actionA).not.toHaveBeenCalled();
    expect(actionB).not.toHaveBeenCalled();
  });

  it('still debounces actions enqueued within the delay after clearing', () => {
    queue.enqueue(() => {});
    queue.clear();
    vi.advanceTimersByTime(delay - 1);
    const action = vi.fn();
    queue.enqueue(action);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  describe('when named actions are enqueued after the queue becomes idle', () => {
    function executionTimestamps() {
      const timestamps: Record<string, number> = {};
      return {
        timestamps,
        recordFor(uniqueId: string) {
          return () => {
            timestamps[uniqueId] = Date.now();
          };
        },
      };
    }

    it('should delay a named action enqueued shortly after the queue becomes idle', () => {
      const {timestamps, recordFor} = executionTimestamps();

      queue.enqueue(recordFor('generated-answer'), 'generated-answer');
      vi.runAllTimers();

      vi.advanceTimersByTime(1);
      queue.enqueue(recordFor('query-summary'), 'query-summary');

      const gap = timestamps['query-summary'] - timestamps['generated-answer'];
      expect(gap).toBeGreaterThanOrEqual(delay);
    });

    it('should delay a named action for every enqueue gap shorter than `delay` after the queue becomes idle', () => {
      for (let gap = 0; gap < delay; gap++) {
        const localQueue = buildDebouncedQueue({delay});
        const {timestamps, recordFor} = executionTimestamps();

        localQueue.enqueue(recordFor('generated-answer'), 'generated-answer');
        vi.runAllTimers();

        vi.advanceTimersByTime(gap);
        localQueue.enqueue(recordFor('query-summary'), 'query-summary');

        const executionGap =
          timestamps['query-summary'] - timestamps['generated-answer'];
        expect(executionGap).toBeGreaterThanOrEqual(delay);

        localQueue.clear();
        vi.runAllTimers();
      }
    });

    it('should delay a named action enqueued synchronously by another action', () => {
      const {timestamps, recordFor} = executionTimestamps();

      queue.enqueue(() => {
        recordFor('generated-answer')();
        queue.enqueue(recordFor('query-summary'), 'query-summary');
      }, 'generated-answer');

      vi.advanceTimersByTime(delay);

      const gap = timestamps['query-summary'] - timestamps['generated-answer'];
      expect(gap).toBeGreaterThanOrEqual(delay);
    });
  });

  describe('preservation: single-region timing is unaffected', () => {
    it('executes the first of several enqueued actions synchronously and spaces each subsequent one by at least `delay` ms, for a range of action counts and inter-enqueue gaps, using the same `uniqueId`', () => {
      const actionCounts = [1, 2, 3, 5];
      const enqueueGaps = [0, 1, delay - 1, delay, delay + 1, delay * 2];

      for (const actionCount of actionCounts) {
        for (const gap of enqueueGaps) {
          const localQueue = buildDebouncedQueue({delay});
          const executionTimestamps: number[] = [];

          for (let i = 0; i < actionCount; i++) {
            if (i > 0) {
              vi.advanceTimersByTime(gap);
            }
            localQueue.enqueue(
              () => executionTimestamps.push(Date.now()),
              'same-region'
            );
          }
          vi.runAllTimers();

          expect(executionTimestamps.length).toBeGreaterThan(0);
          for (let i = 1; i < executionTimestamps.length; i++) {
            const executionGap =
              executionTimestamps[i] - executionTimestamps[i - 1];
            expect(executionGap).toBeGreaterThanOrEqual(delay);
          }

          localQueue.clear();
          vi.runAllTimers();
        }
      }
    });

    it('executes the first of several anonymously enqueued actions synchronously and spaces each subsequent one by at least `delay` ms, for a range of action counts and inter-enqueue gaps, with no `uniqueId`', () => {
      const actionCounts = [1, 2, 3, 5];
      const enqueueGaps = [0, 1, delay - 1, delay, delay + 1, delay * 2];

      for (const actionCount of actionCounts) {
        for (const gap of enqueueGaps) {
          const localQueue = buildDebouncedQueue({delay});
          const executionTimestamps: number[] = [];

          for (let i = 0; i < actionCount; i++) {
            if (i > 0) {
              vi.advanceTimersByTime(gap);
            }
            localQueue.enqueue(() => executionTimestamps.push(Date.now()));
          }
          vi.runAllTimers();

          expect(executionTimestamps).toHaveLength(actionCount);
          for (let i = 1; i < executionTimestamps.length; i++) {
            const executionGap =
              executionTimestamps[i] - executionTimestamps[i - 1];
            expect(executionGap).toBeGreaterThanOrEqual(delay);
          }

          localQueue.clear();
          vi.runAllTimers();
        }
      }
    });
  });
});
