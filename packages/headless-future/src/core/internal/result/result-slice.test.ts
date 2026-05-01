/**
 * Result Slice Tests (Singular)
 */

import {describe, it, expect} from 'vitest';
import {
  resultSlice,
  initialResultState,
  defaultResultState,
} from './result-slice.js';

describe('resultSlice: initialState', () => {
  it('should have an empty map as initial state', () => {
    expect(initialResultState).toEqual({});
  });

  it('should have correct default per-result state', () => {
    expect(defaultResultState).toEqual({
      isSelected: false,
      isExpanded: false,
    });
  });
});

describe('resultSlice: initializeResults', () => {
  it('should create entries for each provided ID', () => {
    const state = resultSlice.reducer(
      initialResultState,
      resultSlice.actions.initializeResults(['r1', 'r2', 'r3'])
    );

    expect(Object.keys(state)).toEqual(['r1', 'r2', 'r3']);
    expect(state['r1']).toEqual(defaultResultState);
    expect(state['r2']).toEqual(defaultResultState);
    expect(state['r3']).toEqual(defaultResultState);
  });

  it('should replace previous entries entirely', () => {
    const existing = {
      old: {isSelected: true, isExpanded: true},
    };

    const state = resultSlice.reducer(
      existing,
      resultSlice.actions.initializeResults(['new1', 'new2'])
    );

    expect(state['old']).toBeUndefined();
    expect(Object.keys(state)).toEqual(['new1', 'new2']);
  });

  it('should accept an empty array', () => {
    const existing = {
      r1: {isSelected: false, isExpanded: false},
    };

    const state = resultSlice.reducer(
      existing,
      resultSlice.actions.initializeResults([])
    );

    expect(state).toEqual({});
  });
});

describe('resultSlice: setSelected', () => {
  it('should set isSelected to true for an existing result', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setSelected({id: 'r1', isSelected: true})
    );

    expect(state['r1'].isSelected).toBe(true);
  });

  it('should set isSelected to false for an existing result', () => {
    const initial = {
      r1: {isSelected: true, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setSelected({id: 'r1', isSelected: false})
    );

    expect(state['r1'].isSelected).toBe(false);
  });

  it('should not modify state for a non-existent result', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setSelected({id: 'unknown', isSelected: true})
    );

    expect(state).toEqual(initial);
  });

  it('should not affect other fields', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: true},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setSelected({id: 'r1', isSelected: true})
    );

    expect(state['r1'].isExpanded).toBe(true);
  });
});

describe('resultSlice: setExpanded', () => {
  it('should set isExpanded to true for an existing result', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setExpanded({id: 'r1', isExpanded: true})
    );

    expect(state['r1'].isExpanded).toBe(true);
  });

  it('should set isExpanded to false for an existing result', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: true},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setExpanded({id: 'r1', isExpanded: false})
    );

    expect(state['r1'].isExpanded).toBe(false);
  });

  it('should not modify state for a non-existent result', () => {
    const initial = {
      r1: {isSelected: false, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setExpanded({id: 'unknown', isExpanded: true})
    );

    expect(state).toEqual(initial);
  });

  it('should not affect other fields', () => {
    const initial = {
      r1: {isSelected: true, isExpanded: false},
    };

    const state = resultSlice.reducer(
      initial,
      resultSlice.actions.setExpanded({id: 'r1', isExpanded: true})
    );

    expect(state['r1'].isSelected).toBe(true);
  });
});

describe('resultSlice: clearAll', () => {
  it('should reset to empty map', () => {
    const populated = {
      r1: {isSelected: true, isExpanded: true},
      r2: {isSelected: false, isExpanded: true},
    };

    const state = resultSlice.reducer(
      populated,
      resultSlice.actions.clearAll()
    );

    expect(state).toEqual({});
  });

  it('should work on already-empty state', () => {
    const state = resultSlice.reducer(
      initialResultState,
      resultSlice.actions.clearAll()
    );

    expect(state).toEqual({});
  });
});

describe('resultSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original = {
      r1: {isSelected: false, isExpanded: false},
    };
    const originalCopy = JSON.parse(JSON.stringify(original));

    resultSlice.reducer(
      original,
      resultSlice.actions.setSelected({id: 'r1', isSelected: true})
    );
    expect(original).toEqual(originalCopy);

    resultSlice.reducer(
      original,
      resultSlice.actions.setExpanded({id: 'r1', isExpanded: true})
    );
    expect(original).toEqual(originalCopy);
  });
});
