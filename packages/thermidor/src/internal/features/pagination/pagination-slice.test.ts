import {describe, it, expect} from 'vitest';
import {
  createPaginationSlice,
  getOrCreatePaginationSlice,
  initialPaginationState,
} from './pagination-slice.js';
import {createPaginationActions, getOrCreatePaginationActions} from './pagination-actions.js';
import {createPaginationSelectors, getOrCreatePaginationSelectors} from './pagination-selectors.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

describe('createPaginationActions', () => {
  it('should create actions scoped to the interface ID', () => {
    const actions = createPaginationActions('search-1');
    expect(actions.setFirstResult.type).toBe('search-1/pagination/setFirstResult');
    expect(actions.setPageSize.type).toBe('search-1/pagination/setPageSize');
    expect(actions.setTotalCount.type).toBe('search-1/pagination/setTotalCount');
  });
  it('should create distinct actions for different interface IDs', () => {
    const actionsA = createPaginationActions('interface-a');
    const actionsB = createPaginationActions('interface-b');
    expect(actionsA.setFirstResult.type).not.toBe(actionsB.setFirstResult.type);
  });
});

describe('getOrCreatePaginationActions', () => {
  it('should return the same instance for the same interface ID', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-actions-test');
    const a = getOrCreatePaginationActions(iface);
    const b = getOrCreatePaginationActions(iface);
    expect(a).toBe(b);
  });
  it('should return different instances for different interface IDs', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'cache-a');
    const ifaceB = createTestInterface(engine, 'cache-b');
    const a = getOrCreatePaginationActions(ifaceA);
    const b = getOrCreatePaginationActions(ifaceB);
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
  it('should handle setFirstResult', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-1');
    const actions = getOrCreatePaginationActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createPaginationSlice('test-1', actions, hydrateAction);
    const state = slice.reducer(initialPaginationState, actions.setFirstResult(20));
    expect(state.firstResult).toBe(20);
    expect(state.pageSize).toBe(10);
    expect(state.totalCount).toBe(0);
  });
  it('should handle setPageSize', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-2');
    const actions = getOrCreatePaginationActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createPaginationSlice('test-2', actions, hydrateAction);
    const state = slice.reducer(initialPaginationState, actions.setPageSize(25));
    expect(state.pageSize).toBe(25);
    expect(state.firstResult).toBe(0);
    expect(state.totalCount).toBe(0);
  });
  it('should handle setTotalCount', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-3');
    const actions = getOrCreatePaginationActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createPaginationSlice('test-3', actions, hydrateAction);
    const state = slice.reducer(initialPaginationState, actions.setTotalCount(100));
    expect(state.totalCount).toBe(100);
    expect(state.firstResult).toBe(0);
    expect(state.pageSize).toBe(10);
  });
  it('should not respond to actions from a different interface', () => {
    const engine = createTestEngine();
    const ifaceX = createTestInterface(engine, 'iface-x');
    const ifaceY = createTestInterface(engine, 'iface-y');
    const actionsX = getOrCreatePaginationActions(ifaceX);
    const hydrateX = getOrCreateHydrateFromSnapshotAction(ifaceX);
    const slice = createPaginationSlice('iface-x', actionsX, hydrateX);
    const otherActions = getOrCreatePaginationActions(ifaceY);
    const state = slice.reducer(initialPaginationState, otherActions.setFirstResult(50));
    expect(state.firstResult).toBe(0);
  });
  it('should maintain state immutability', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'immut-test');
    const actions = getOrCreatePaginationActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createPaginationSlice('immut-test', actions, hydrateAction);
    const original = {...initialPaginationState};
    slice.reducer(original, actions.setFirstResult(30));
    expect(original.firstResult).toBe(0);
  });
});

describe('getOrCreatePaginationSlice', () => {
  it('should return the same slice instance for the same interface ID', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-slice-test');
    const a = getOrCreatePaginationSlice(iface);
    const b = getOrCreatePaginationSlice(iface);
    expect(a).toBe(b);
  });
  it('should return different instances for different interface IDs', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'slice-a');
    const ifaceB = createTestInterface(engine, 'slice-b');
    const a = getOrCreatePaginationSlice(ifaceA);
    const b = getOrCreatePaginationSlice(ifaceB);
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
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-sel-test');
    const a = getOrCreatePaginationSelectors(iface);
    const b = getOrCreatePaginationSelectors(iface);
    expect(a).toBe(b);
  });
  it('should return different instances for different interface IDs', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'sel-a');
    const ifaceB = createTestInterface(engine, 'sel-b');
    const a = getOrCreatePaginationSelectors(ifaceA);
    const b = getOrCreatePaginationSelectors(ifaceB);
    expect(a).not.toBe(b);
  });
});
