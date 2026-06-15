import {describe, it, expect} from 'vitest';
import {buildSearchEndpointRequest} from './search-endpoint-selectors.js';

describe('buildSearchEndpointRequest', () => {
  it('builds request from state', () => {
    const state = {
      'default/searchBox': {query: 'hello'},
      'default/pagination': {firstResult: 20, pageSize: 20, totalCount: 100},
      facets: {},
    };

    const request = buildSearchEndpointRequest(state as any);

    expect(request).toEqual({
      q: 'hello',
      firstResult: 20,
      numberOfResults: 20,
      facets: undefined,
    });
  });

  it('includes facets when present', () => {
    const state = {
      'default/searchBox': {query: ''},
      'default/pagination': {firstResult: 0, pageSize: 10, totalCount: 0},
      facets: {
        category: {
          id: 'category',
          values: [],
          selectedValues: ['electronics'],
        },
      },
    };

    const request = buildSearchEndpointRequest(state as any);

    expect(request.facets).toEqual([
      {
        facetId: 'category',
        field: 'category',
        currentValues: [{value: 'electronics', state: 'selected'}],
      },
    ]);
  });

  it('uses defaults when slices are missing', () => {
    const request = buildSearchEndpointRequest({} as any);

    expect(request).toEqual({
      q: '',
      firstResult: 0,
      numberOfResults: 10,
      facets: undefined,
    });
  });
});
