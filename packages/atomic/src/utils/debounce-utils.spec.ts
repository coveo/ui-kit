import {buildDebouncedQueue, DebouncedQueue} from './debounce-utils';

describe('buildDebouncedQueue', () => {
  let queue: DebouncedQueue;
  const delay = 5;
  beforeEach(() => {
    jest.useFakeTimers();
    queue = buildDebouncedQueue({delay});
  });

  afterEach(() => {
    queue.clear();
  });

  it('executes the first action synchronously', () => {
    const action = jest.fn();
    queue.enqueue(action);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("doesn't execute actions more than once", () => {
    const action = jest.fn();
    queue.enqueue(action);
    jest.runAllTimers();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('debounces actions by the given delay', () => {
    const action = jest.fn();
    queue.enqueue(() => {});
    queue.enqueue(action);
    jest.advanceTimersByTime(delay - 1);
    expect(action).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('debounces actions executed after the last action within the delay', () => {
    queue.enqueue(() => {}); // Finishes at 0
    queue.enqueue(() => {}); // Finishes at `delay`
    jest.advanceTimersByTime(delay * 2 - 1);
    const action = jest.fn();
    queue.enqueue(action);
    expect(action).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("doesn't debounce actions executed after the last action past the delay", () => {
    queue.enqueue(() => {}); // Finishes at 0
    queue.enqueue(() => {}); // Finishes at `delay`
    jest.advanceTimersByTime(delay * 2);
    const action = jest.fn();
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
    jest.runAllTimers();
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
    jest.runAllTimers();
    expect(completedActions).toEqual(['A', 'C']);
  });

  it('can clear the queue', () => {
    const actionA = jest.fn();
    const actionB = jest.fn();
    queue.enqueue(() => {});
    queue.enqueue(actionA);
    queue.enqueue(actionB);
    queue.clear();
    jest.runAllTimers();
    expect(actionA).not.toHaveBeenCalled();
    expect(actionB).not.toHaveBeenCalled();
  });

  it('still debounces actions enqueued within the delay after clearing', () => {
    queue.enqueue(() => {});
    queue.clear();
    jest.advanceTimersByTime(delay - 1);
    const action = jest.fn();
    queue.enqueue(action);
    expect(action).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
