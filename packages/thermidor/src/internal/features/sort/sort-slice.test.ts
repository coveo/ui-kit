import {describe, it, expect} from 'vitest';
import {createSortSlice, getOrCreateSortSlice, initialSortState} from './sort-slice.js';
import {createSortActions, getOrCreateSortActions} from './sort-actions.js';
import {createSortSelectors, getOrCreateSortSelectors} from './sort-selectors.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';

describe('createSortActions', () => {
  it('should create actions scoped to the interface ID', () => {
    const actions = createSortActions('search-1');
    expect(actions.updateFromResponse.type).toBe('search-1/sort/updateFromResponse');
    expect(actions.sortBy.type).toBe('search-1/sort/sortBy');
  });

  it('should create distinct actions for different interface IDs', () => {
    const actionsA = createSortActions('interface-a');
    const actionsB = createSortActions('interface-b');
    expect(actionsA.updateFromResponse.type).not.toBe(actionsB.updateFromResponse.type);
    expect(actionsA.sortBy.type).not.toBe(actionsB.sortBy.type);
  });
});

describe('getOrCreateSortActions', () => {
  it('should return the same instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-actions-test');
    const a = getOrCreateSortActions(iface);
    const b = getOrCreateSortActions(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'cache-a');
    const ifaceB = createTestInterface(engine, 'cache-b');
    const a = getOrCreateSortActions(ifaceA);
    const b = getOrCreateSortActions(ifaceB);
    expect(a).not.toBe(b);
  });
});

describe('createSortSlice', () => {
  it('should have the correct initial state', () => {
    expect(initialSortState).toEqual({
      appliedSort: null,
      availableSorts: [],
    });
  });

  it('should handle updateFromResponse with valid payload', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-1');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('test-1', actions, hydrateAction);

    const payload = {
      appliedSort: {sortCriteria: 'relevancy'},
      availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
    };

    const state = slice.reducer(initialSortState, actions.updateFromResponse(payload));
    expect(state.appliedSort).toEqual({sortCriteria: 'relevancy'});
    expect(state.availableSorts).toEqual([
      {sortCriteria: 'relevancy'},
      {sortCriteria: 'date ascending'},
    ]);
  });

  it('should handle updateFromResponse with undefined as a no-op', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-2');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('test-2', actions, hydrateAction);

    const currentState = {
      appliedSort: {sortCriteria: 'date ascending'},
      availableSorts: [{sortCriteria: 'date ascending'}],
    };

    const state = slice.reducer(currentState, actions.updateFromResponse(undefined));
    expect(state).toEqual(currentState);
  });

  it('should handle sortBy setting appliedSort to the given criterion', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-3');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('test-3', actions, hydrateAction);

    const criterion = {sortCriteria: '@price descending'};
    const state = slice.reducer(initialSortState, actions.sortBy(criterion));
    expect(state.appliedSort).toEqual(criterion);
  });

  it('should not modify availableSorts when sortBy is dispatched', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test-4');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('test-4', actions, hydrateAction);

    const currentState = {
      appliedSort: {sortCriteria: 'relevancy'},
      availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
    };

    const criterion = {sortCriteria: 'date ascending'};
    const state = slice.reducer(currentState, actions.sortBy(criterion));
    expect(state.availableSorts).toEqual(currentState.availableSorts);
  });

  it('should not respond to actions from a different interface', () => {
    const engine = createTestEngine();
    const ifaceX = createTestInterface(engine, 'iface-x');
    const ifaceY = createTestInterface(engine, 'iface-y');
    const actionsX = getOrCreateSortActions(ifaceX);
    const hydrateActionX = getOrCreateHydrateFromSnapshotAction(ifaceX);
    const slice = createSortSlice('iface-x', actionsX, hydrateActionX);
    const otherActions = getOrCreateSortActions(ifaceY);

    const state = slice.reducer(
      initialSortState,
      otherActions.sortBy({sortCriteria: 'date descending'})
    );
    expect(state.appliedSort).toBeNull();
  });

  it('should maintain state immutability', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'immut-test');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('immut-test', actions, hydrateAction);

    const original = {...initialSortState};
    slice.reducer(original, actions.sortBy({sortCriteria: 'relevancy'}));
    expect(original.appliedSort).toBeNull();
  });

  it('should hydrate state from hydrateFromSnapshot with sort payload', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'hydrate-test');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('hydrate-test', actions, hydrateAction);

    const snapshotPayload = {
      sort: {
        appliedSort: {sortCriteria: 'relevancy'},
        availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
      },
    };

    const state = slice.reducer(initialSortState, hydrateAction(snapshotPayload));
    expect(state.appliedSort).toEqual({sortCriteria: 'relevancy'});
    expect(state.availableSorts).toEqual([
      {sortCriteria: 'relevancy'},
      {sortCriteria: 'date ascending'},
    ]);
  });

  it('should be a no-op when hydrateFromSnapshot payload has no sort field', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'hydrate-no-sort');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('hydrate-no-sort', actions, hydrateAction);

    const snapshotPayload = {
      pagination: {page: 0, perPage: 10, totalEntries: 100, totalPages: 10},
    };

    const state = slice.reducer(initialSortState, hydrateAction(snapshotPayload));
    expect(state).toEqual(initialSortState);
  });

  it('should be a no-op when hydrateFromSnapshot payload is null-like', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'hydrate-null');
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    const slice = createSortSlice('hydrate-null', actions, hydrateAction);

    const state = slice.reducer(
      initialSortState,
      hydrateAction(null as unknown as Record<string, unknown>)
    );
    expect(state).toEqual(initialSortState);
  });
});

describe('getOrCreateSortSlice', () => {
  it('should return the same slice instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-slice-test');
    const a = getOrCreateSortSlice(iface);
    const b = getOrCreateSortSlice(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'slice-a');
    const ifaceB = createTestInterface(engine, 'slice-b');
    const a = getOrCreateSortSlice(ifaceA);
    const b = getOrCreateSortSlice(ifaceB);
    expect(a).not.toBe(b);
  });
});

describe('createSortSelectors', () => {
  it('should read appliedSort from scoped state', () => {
    const selectors = createSortSelectors('sel-test');
    const state = {
      'sel-test/sort': {
        appliedSort: {sortCriteria: 'relevancy'},
        availableSorts: [{sortCriteria: 'relevancy'}],
      },
    };
    expect(selectors.getAppliedSort(state)).toEqual({sortCriteria: 'relevancy'});
  });

  it('should read availableSorts from scoped state', () => {
    const selectors = createSortSelectors('sel-test-2');
    const state = {
      'sel-test-2/sort': {
        appliedSort: {sortCriteria: 'date ascending'},
        availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
      },
    };
    expect(selectors.getAvailableSorts(state)).toEqual([
      {sortCriteria: 'relevancy'},
      {sortCriteria: 'date ascending'},
    ]);
  });

  it('should fall back to initial state when slice is not present', () => {
    const selectors = createSortSelectors('missing-slice');
    const state = {};
    expect(selectors.getAppliedSort(state)).toBeNull();
    expect(selectors.getAvailableSorts(state)).toEqual([]);
  });

  it('should return the same reference for the same state (caching)', () => {
    const selectors = createSortSelectors('cache-test');
    const state = {
      'cache-test/sort': {
        appliedSort: {sortCriteria: 'relevancy'},
        availableSorts: [{sortCriteria: 'relevancy'}],
      },
    };
    const first = selectors.getAvailableSorts(state);
    const second = selectors.getAvailableSorts(state);
    expect(first).toBe(second);
  });
});

describe('getOrCreateSortSelectors', () => {
  it('should return the same instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-sel-test');
    const a = getOrCreateSortSelectors(iface);
    const b = getOrCreateSortSelectors(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'sel-a');
    const ifaceB = createTestInterface(engine, 'sel-b');
    const a = getOrCreateSortSelectors(ifaceA);
    const b = getOrCreateSortSelectors(ifaceB);
    expect(a).not.toBe(b);
  });
});
