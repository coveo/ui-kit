import {describe, expect, it, vi} from 'vitest';
import {createMemoizedStateSelector} from './memoized-state-selector.js';

interface TestState {
  a: number;
  b: number;
  nested: {value: string};
}

describe('createMemoizedStateSelector', () => {
  it('returns the same result reference when dependencies are unchanged', () => {
    const projector = vi.fn((a: number, b: number) => ({sum: a + b}));
    const selector = createMemoizedStateSelector(
      [(state: TestState) => state.a, (state: TestState) => state.b],
      projector
    );

    const state = {a: 1, b: 2, nested: {value: 'x'}};
    const first = selector(state);
    const second = selector({...state, nested: {value: 'y'}});

    expect(first).toBe(second);
    expect(projector).toHaveBeenCalledTimes(1);
  });

  it('recomputes and returns a new reference when at least one dependency changes', () => {
    const selector = createMemoizedStateSelector(
      [(state: TestState) => state.a, (state: TestState) => state.b],
      (a, b) => ({sum: a + b})
    );

    const first = selector({a: 1, b: 2, nested: {value: 'x'}});
    const second = selector({a: 2, b: 2, nested: {value: 'x'}});

    expect(first).not.toBe(second);
    expect(first).toEqual({sum: 3});
    expect(second).toEqual({sum: 4});
  });

  it('uses Object.is semantics when comparing dependency values', () => {
    const projector = vi.fn((value: number) => ({value}));
    const selector = createMemoizedStateSelector(
      [(state: {value: number}) => state.value],
      projector
    );

    const first = selector({value: NaN});
    const second = selector({value: NaN});

    expect(first).toBe(second);
    expect(projector).toHaveBeenCalledTimes(1);
  });
});
