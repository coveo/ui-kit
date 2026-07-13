import {describe, it, expect} from 'vitest';
import {createSelectSlice} from './select-slice.js';

describe('createSelectSlice', () => {
  const initialState = {query: '', isActive: false};

  it('returns the slice value when the key exists in state', () => {
    const selector = createSelectSlice('search-1', 'searchBox', initialState);
    const state = {'search-1/searchBox': {query: 'hello', isActive: true}};

    expect(selector(state)).toEqual({query: 'hello', isActive: true});
  });

  it('returns initialState when the key is missing from state', () => {
    const selector = createSelectSlice('search-1', 'searchBox', initialState);
    const state = {};

    expect(selector(state)).toBe(initialState);
  });

  it('returns initialState when the key is explicitly undefined', () => {
    const selector = createSelectSlice('search-1', 'searchBox', initialState);
    const state = {'search-1/searchBox': undefined};

    expect(selector(state)).toBe(initialState);
  });

  it('constructs the key as interfaceId/featureName', () => {
    const selector = createSelectSlice('commerce-2', 'pagination', {page: 0});
    const state = {'commerce-2/pagination': {page: 3}};

    expect(selector(state)).toEqual({page: 3});
  });

  it('does not fall back when the slice value is falsy but defined', () => {
    const selector = createSelectSlice('iface', 'count', 42);
    const state = {'iface/count': 0};

    expect(selector(state)).toBe(0);
  });
});
