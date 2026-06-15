import {describe, it, expect, vi} from 'vitest';
import {handleSearchEndpointResponse} from './search-endpoint-response-handler.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointResponse} from './search-endpoint-types.js';

describe('handleSearchEndpointResponse', () => {
  it('dispatches results, totalCount, and facets mutations', () => {
    const engine = {mutate: vi.fn()} as unknown as FullEngine;
    const response: CoveoSearchEndpointResponse = {
      totalCount: 42,
      results: [
        {
          uniqueId: 'r1',
          title: 'T',
          uri: 'u',
          printableUri: 'p',
          clickUri: 'c',
          raw: {},
          score: 1,
        },
      ],
      facets: [{facetId: 'f1', field: 'f1', values: []}],
    };

    handleSearchEndpointResponse(engine, response);

    expect(engine.mutate).toHaveBeenCalledTimes(3);
    expect(engine.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'default/results/setResultsFromResponse',
        payload: response.results,
      })
    );
    expect(engine.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'default/pagination/setTotalCount',
        payload: 42,
      })
    );
    expect(engine.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'default/facets/updateFromResponse',
        payload: response.facets,
      })
    );
  });
});
