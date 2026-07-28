/**
 * SearchBox Slice Tests (Scoped Factories)
 */

import {describe, it, expect} from 'vitest';
import {
  createSearchBoxSlice,
  getOrCreateSearchBoxSlice,
  initialSearchBoxState,
} from './search-box-slice.js';
import {createSearchBoxActions, getOrCreateSearchBoxActions} from './search-box-actions.js';
import {createSearchBoxSelectors, getOrCreateSearchBoxSelectors} from './search-box-selectors.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';

describe('createSearchBoxActions', () => {
  it('should create actions scoped to the interfaceId', () => {
    const actions = createSearchBoxActions('search');
    expect(actions.setQuery.type).toBe('search/searchBox/setQuery');
  });

  it('should create different actions for different interfaceIds', () => {
    const actionsA = createSearchBoxActions('interfaceA');
    const actionsB = createSearchBoxActions('interfaceB');
    expect(actionsA.setQuery.type).not.toBe(actionsB.setQuery.type);
  });
});

describe('getOrCreateSearchBoxActions', () => {
  it('should return the same instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-actions');
    const a = getOrCreateSearchBoxActions(iface);
    const b = getOrCreateSearchBoxActions(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'actions-x');
    const ifaceB = createTestInterface(engine, 'actions-y');
    const a = getOrCreateSearchBoxActions(ifaceA);
    const b = getOrCreateSearchBoxActions(ifaceB);
    expect(a).not.toBe(b);
  });
});

describe('createSearchBoxSlice', () => {
  it('should have correct initial state', () => {
    expect(initialSearchBoxState).toEqual({query: ''});
  });

  it('should create a slice with scoped name', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'myInterface');
    const actions = getOrCreateSearchBoxActions(iface);
    const slice = createSearchBoxSlice('myInterface', actions);
    expect(slice.name).toBe('myInterface/searchBox');
  });

  it('should update query via scoped setQuery action', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test');
    const actions = getOrCreateSearchBoxActions(iface);
    const slice = createSearchBoxSlice('test', actions);

    const state = slice.reducer(initialSearchBoxState, actions.setQuery('laptops'));
    expect(state.query).toBe('laptops');
  });

  it('should accept empty string', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test2');
    const actions = getOrCreateSearchBoxActions(iface);
    const slice = createSearchBoxSlice('test2', actions);

    const state = slice.reducer({query: 'existing'}, actions.setQuery(''));
    expect(state.query).toBe('');
  });

  it('should maintain state immutability', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'test3');
    const actions = getOrCreateSearchBoxActions(iface);
    const slice = createSearchBoxSlice('test3', actions);

    const original = {...initialSearchBoxState};
    slice.reducer(original, actions.setQuery('test'));
    expect(original.query).toBe('');
  });
});

describe('getOrCreateSearchBoxSlice', () => {
  it('should return the same instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-slice');
    const a = getOrCreateSearchBoxSlice(iface);
    const b = getOrCreateSearchBoxSlice(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'slice-x');
    const ifaceB = createTestInterface(engine, 'slice-y');
    const a = getOrCreateSearchBoxSlice(ifaceA);
    const b = getOrCreateSearchBoxSlice(ifaceB);
    expect(a).not.toBe(b);
  });
});

describe('createSearchBoxSelectors', () => {
  it('should return getQuery selector scoped to the interfaceId', () => {
    const selectors = createSearchBoxSelectors('mySearch');
    const state = {'mySearch/searchBox': {query: 'hello'}};
    expect(selectors.getQuery(state)).toBe('hello');
  });

  it('should return initial state when slice is not present', () => {
    const selectors = createSearchBoxSelectors('missing');
    const state = {};
    expect(selectors.getQuery(state)).toBe('');
  });
});

describe('getOrCreateSearchBoxSelectors', () => {
  it('should return the same instance for the same interface', () => {
    const engine = createTestEngine();
    const iface = createTestInterface(engine, 'cached-sel');
    const a = getOrCreateSearchBoxSelectors(iface);
    const b = getOrCreateSearchBoxSelectors(iface);
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaces', () => {
    const engine = createTestEngine();
    const ifaceA = createTestInterface(engine, 'sel-x');
    const ifaceB = createTestInterface(engine, 'sel-y');
    const a = getOrCreateSearchBoxSelectors(ifaceA);
    const b = getOrCreateSearchBoxSelectors(ifaceB);
    expect(a).not.toBe(b);
  });
});
