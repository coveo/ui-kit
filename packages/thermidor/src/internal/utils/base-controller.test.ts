import {describe, it, expect, vi} from 'vitest';
import {BaseController} from './base-controller.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {StateSelector, Unsubscribe} from '@/src/internal/engine/index.js';

interface TestState {
  value: number;
  label: string;
}

class TestController extends BaseController<TestState> {
  constructor(engine: FullEngine, stateSelector: StateSelector<TestState>) {
    super(engine, stateSelector);
  }
}

function createMockEngine() {
  return {
    read: vi.fn(),
    subscribe: vi.fn(),
    mutate: vi.fn(),
    adoptSlice: vi.fn(),
  } as unknown as FullEngine;
}

describe('BaseController', () => {
  describe('state getter', () => {
    it('returns whatever engine.read(selector) returns', () => {
      const mockEngine = createMockEngine();
      const expectedState: TestState = {value: 42, label: 'test'};
      vi.mocked(mockEngine.read).mockReturnValue(expectedState);

      const selector: StateSelector<TestState> = (state) =>
        state as unknown as TestState;
      const controller = new TestController(mockEngine, selector);

      const result = controller.state;

      expect(result).toBe(expectedState);
      expect(mockEngine.read).toHaveBeenCalledWith(selector);
    });

    it('always delegates to engine.read without local caching', () => {
      const mockEngine = createMockEngine();
      const firstState: TestState = {value: 1, label: 'first'};
      const secondState: TestState = {value: 2, label: 'second'};
      vi.mocked(mockEngine.read)
        .mockReturnValueOnce(firstState)
        .mockReturnValueOnce(secondState);

      const selector: StateSelector<TestState> = (state) =>
        state as unknown as TestState;
      const controller = new TestController(mockEngine, selector);

      expect(controller.state).toBe(firstState);
      expect(controller.state).toBe(secondState);
      expect(mockEngine.read).toHaveBeenCalledTimes(2);
    });
  });

  describe('subscribe', () => {
    it('delegates to engine.subscribe with the selector and callback', () => {
      const mockEngine = createMockEngine();
      const unsubscribeFn = vi.fn();
      vi.mocked(mockEngine.subscribe).mockReturnValue(unsubscribeFn);

      const selector: StateSelector<TestState> = (state) =>
        state as unknown as TestState;
      const controller = new TestController(mockEngine, selector);
      const callback = vi.fn();

      controller.subscribe(callback);

      expect(mockEngine.subscribe).toHaveBeenCalledWith(selector, callback);
    });

    it('returns the unsubscribe function from engine', () => {
      const mockEngine = createMockEngine();
      const unsubscribeFn: Unsubscribe = vi.fn();
      vi.mocked(mockEngine.subscribe).mockReturnValue(unsubscribeFn);

      const selector: StateSelector<TestState> = (state) =>
        state as unknown as TestState;
      const controller = new TestController(mockEngine, selector);

      const result = controller.subscribe(vi.fn());

      expect(result).toBe(unsubscribeFn);
    });
  });
});
