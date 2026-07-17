import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createSearchEndpointRequestSelector} from './search-request-selector.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

vi.mock('@/src/internal/features/search-box/index.js', () => ({
  getOrCreateSearchBoxSelectors: () => ({
    getQuery: (state: any) => state.__query ?? '',
  }),
}));

vi.mock('@/src/internal/features/pagination/index.js', () => ({
  getOrCreatePaginationSelectors: () => ({
    getFirstResult: (state: any) => state.__firstResult ?? 0,
    getPageSize: (state: any) => state.__pageSize ?? 10,
  }),
}));

vi.mock('@/src/internal/features/facets/index.js', () => ({
  getOrCreateFacetsSelectors: () => ({
    buildFacetsRequest: (state: any) => state.__facets ?? undefined,
  }),
}));

vi.mock('@/src/internal/features/search-parameters/index.js', () => ({
  getOrCreateSearchParametersSelectors: () => ({
    getPipeline: (state: any) => state.__pipeline ?? '',
    getConstantQuery: (state: any) => state.__cq ?? '',
  }),
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getLanguage: (state: any) => state.__language ?? '',
  }),
}));

const mockInterface: InterfaceHandle = {
  disposed: false,
  dispose: vi.fn(),
};

describe('createSearchEndpointRequestSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds request with all fields from state', () => {
    const selector = createSearchEndpointRequestSelector(mockInterface);

    const state = {
      __query: 'hello world',
      __firstResult: 20,
      __pageSize: 5,
      __facets: [{facetId: 'author', selectedValues: ['John']}],
      __pipeline: 'my-pipeline',
      __cq: '@source=="KB"',
      __language: 'fr',
    };

    const result = selector(state);

    expect(result).toEqual({
      q: 'hello world',
      firstResult: 20,
      numberOfResults: 5,
      facets: [{facetId: 'author', selectedValues: ['John']}],
      pipeline: 'my-pipeline',
      cq: '@source=="KB"',
      locale: 'fr',
    });
  });

  it('sets locale to undefined when language is empty', () => {
    const selector = createSearchEndpointRequestSelector(mockInterface);

    const state = {
      __query: 'test',
      __language: '',
    };

    const result = selector(state);

    expect(result.locale).toBeUndefined();
  });

  it('uses default values when state slices are empty', () => {
    const selector = createSearchEndpointRequestSelector(mockInterface);

    const result = selector({});

    expect(result).toEqual({
      q: '',
      firstResult: 0,
      numberOfResults: 10,
      facets: undefined,
      pipeline: '',
      cq: '',
      locale: undefined,
    });
  });

  it('returns memoized result when state has not changed', () => {
    const selector = createSearchEndpointRequestSelector(mockInterface);
    const state = {__query: 'same'};

    const result1 = selector(state);
    const result2 = selector(state);

    expect(result1).toBe(result2);
  });

  it('returns new result when state changes', () => {
    const selector = createSearchEndpointRequestSelector(mockInterface);

    const result1 = selector({__query: 'first'});
    const result2 = selector({__query: 'second'});

    expect(result1).not.toBe(result2);
    expect(result1.q).toBe('first');
    expect(result2.q).toBe('second');
  });
});
