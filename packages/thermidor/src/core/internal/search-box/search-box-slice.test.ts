/**
 * SearchBox Slice Tests (Scoped Factories)
 */

import {describe, it, expect} from 'vitest';
import {
  createSearchBoxSlice,
  getOrCreateSearchBoxSlice,
  initialSearchBoxState,
} from './search-box-slice.js';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';
import {
  createSearchBoxSelectors,
  getOrCreateSearchBoxSelectors,
} from './search-box-selectors.js';

describe('getOrCreateSearchBoxActions', () => {
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateSearchBoxActions('cached-actions');
    const b = getOrCreateSearchBoxActions('cached-actions');
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateSearchBoxActions('actions-x');
    const b = getOrCreateSearchBoxActions('actions-y');
    expect(a).not.toBe(b);
  });
});

describe('createSearchBoxSlice', () => {
  it('should have correct initial state', () => {
    expect(initialSearchBoxState).toEqual({query: ''});
  });

  it('should create a slice with scoped name', () => {
    const slice = createSearchBoxSlice('myInterface');
    expect(slice.name).toBe('myInterface/searchBox');
  });

  it('should update query via scoped setQuery action', () => {
    const actions = getOrCreateSearchBoxActions('test');
    const slice = createSearchBoxSlice('test');

    const state = slice.reducer(
      initialSearchBoxState,
      actions.setQuery('laptops')
    );
    expect(state.query).toBe('laptops');
  });

  it('should accept empty string', () => {
    const actions = getOrCreateSearchBoxActions('test2');
    const slice = createSearchBoxSlice('test2');

    const state = slice.reducer({query: 'existing'}, actions.setQuery(''));
    expect(state.query).toBe('');
  });

  it('should maintain state immutability', () => {
    const actions = getOrCreateSearchBoxActions('test3');
    const slice = createSearchBoxSlice('test3');

    const original = {...initialSearchBoxState};
    slice.reducer(original, actions.setQuery('test'));
    expect(original.query).toBe('');
  });
});

describe('getOrCreateSearchBoxSlice', () => {
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateSearchBoxSlice('cached-slice');
    const b = getOrCreateSearchBoxSlice('cached-slice');
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateSearchBoxSlice('slice-x');
    const b = getOrCreateSearchBoxSlice('slice-y');
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
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateSearchBoxSelectors('cached-sel');
    const b = getOrCreateSearchBoxSelectors('cached-sel');
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateSearchBoxSelectors('sel-x');
    const b = getOrCreateSearchBoxSelectors('sel-y');
    expect(a).not.toBe(b);
  });
});
