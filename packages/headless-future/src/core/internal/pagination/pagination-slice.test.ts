import {describe, it, expect} from 'vitest';
import {
  createPaginationSlice,
  getOrCreatePaginationSlice,
  initialPaginationState,
} from './pagination-slice.js';
import {
  createPaginationActions,
  getOrCreatePaginationActions,
} from './pagination-actions.js';
import {
  createPaginationSelectors,
  getOrCreatePaginationSelectors,
} from './pagination-selectors.js';

describe('createPaginationActions', () => {
  it('should create actions scoped to the interface ID', () => {
    const actions = createPaginationActions('search-1');

    expect(actions.setFirstResult.type).toBe(
      'search-1/pagination/setFirstResult'
    );
    expect(actions.setPageSize.type).toBe('search-1/pagination/setPageSize');
    expect(actions.setTotalCount.type).toBe(
      'search-1/pagination/setTotalCount'
    );
  });

  it('should create distinct actions for different interface IDs', () => {
    const actionsA = createPaginationActions('interface-a');
    const actionsB = createPaginationActions('interface-b');

    expect(actionsA.setFirstResult.type).not.toBe(actionsB.setFirstResult.type);
  });
});

describe('getOrCreatePaginationActions', () => {
  it('should return the same instance for the same interface ID', () => {
    const a = getOrCreatePaginationActions('cached-actions-test');
    const b = getOrCreatePaginationActions('cached-actions-test');

    expect(a).toBe(b);
  });

  it('should return different instances for different interface IDs', () => {
    const a = getOrCreatePaginationActions('cache-a');
    const b = getOrCreatePaginationActions('cache-b');

    expect(a).not.toBe(b);
  });
});

describe('createPaginationSlice', () => {
  it('should have the correct initial state', () => {
    expect(initialPaginationState).toEqual({
      firstResult: 0,
      pageSize: 10,
      totalCount: 0,
    });
  });

  it('should create a slice with scoped name', () => {
    const slice = createPaginationSlice('search-1');

    expect(slice.name).toBe('search-1/pagination');
  });

  it('should handle setFirstResult', () => {
    const slice = createPaginationSlice('test-1');
    const actions = getOrCreatePaginationActions('test-1');

    const state = slice.reducer(
      initialPaginationState,
      actions.setFirstResult(20)
    );

    expect(state.firstResult).toBe(20);
    expect(state.pageSize).toBe(10);
    expect(state.totalCount).toBe(0);
  });

  it('should handle setPageSize', () => {
    const slice = createPaginationSlice('test-2');
    const actions = getOrCreatePaginationActions('test-2');

    const state = slice.reducer(
      initialPaginationState,
      actions.setPageSize(25)
    );

    expect(state.pageSize).toBe(25);
    expect(state.firstResult).toBe(0);
    expect(state.totalCount).toBe(0);
  });

  it('should handle setTotalCount', () => {
    const slice = createPaginationSlice('test-3');
    const actions = getOrCreatePaginationActions('test-3');

    const state = slice.reducer(
      initialPaginationState,
      actions.setTotalCount(100)
    );

    expect(state.totalCount).toBe(100);
    expect(state.firstResult).toBe(0);
    expect(state.pageSize).toBe(10);
  });

  it('should not respond to actions from a different interface', () => {
    const slice = createPaginationSlice('iface-x');
    const otherActions = getOrCreatePaginationActions('iface-y');

    const state = slice.reducer(
      initialPaginationState,
      otherActions.setFirstResult(50)
    );

    expect(state.firstResult).toBe(0);
  });

  it('should maintain state immutability', () => {
    const slice = createPaginationSlice('immut-test');
    const actions = getOrCreatePaginationActions('immut-test');
    const original = {...initialPaginationState};

    slice.reducer(original, actions.setFirstResult(30));

    expect(original.firstResult).toBe(0);
  });
});

describe('getOrCreatePaginationSlice', () => {
  it('should return the same slice instance for the same interface ID', () => {
    const a = getOrCreatePaginationSlice('cached-slice-test');
    const b = getOrCreatePaginationSlice('cached-slice-test');

    expect(a).toBe(b);
  });

  it('should return different instances for different interface IDs', () => {
    const a = getOrCreatePaginationSlice('slice-a');
    const b = getOrCreatePaginationSlice('slice-b');

    expect(a).not.toBe(b);
  });
});

describe('createPaginationSelectors', () => {
  it('should read firstResult from scoped state', () => {
    const selectors = createPaginationSelectors('sel-test');
    const state = {
      'sel-test/pagination': {firstResult: 30, pageSize: 10, totalCount: 100},
    };

    expect(selectors.getFirstResult(state)).toBe(30);
  });

  it('should read pageSize from scoped state', () => {
    const selectors = createPaginationSelectors('sel-test-2');
    const state = {
      'sel-test-2/pagination': {firstResult: 0, pageSize: 25, totalCount: 50},
    };

    expect(selectors.getPageSize(state)).toBe(25);
  });

  it('should read totalCount from scoped state', () => {
    const selectors = createPaginationSelectors('sel-test-3');
    const state = {
      'sel-test-3/pagination': {firstResult: 0, pageSize: 10, totalCount: 200},
    };

    expect(selectors.getTotalCount(state)).toBe(200);
  });

  it('should fall back to initial state when slice is not present', () => {
    const selectors = createPaginationSelectors('missing-slice');
    const state = {};

    expect(selectors.getFirstResult(state)).toBe(0);
    expect(selectors.getPageSize(state)).toBe(10);
    expect(selectors.getTotalCount(state)).toBe(0);
  });
});

describe('getOrCreatePaginationSelectors', () => {
  it('should return the same instance for the same interface ID', () => {
    const a = getOrCreatePaginationSelectors('cached-sel-test');
    const b = getOrCreatePaginationSelectors('cached-sel-test');

    expect(a).toBe(b);
  });

  it('should return different instances for different interface IDs', () => {
    const a = getOrCreatePaginationSelectors('sel-a');
    const b = getOrCreatePaginationSelectors('sel-b');

    expect(a).not.toBe(b);
  });
});
