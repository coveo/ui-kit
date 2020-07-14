import {createMockState} from '../../../test/mock-state';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {facetSelector, facetRequestSelector} from './facet-set-selectors';
import {buildFacetRequest} from './facet-set-slice';

describe('facet-set selectors', () => {
  it('#facetSelector gets the facet response by id', () => {
    const facetId = '1';
    const state = createMockState();
    const facetResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [facetResponse];

    expect(facetSelector(state, facetId)).toBe(facetResponse);
  });

  it('when the id is not found, #facetSelector returns undefined', () => {
    const state = createMockState();
    expect(facetSelector(state, '1')).toBe(undefined);
  });

  it('#facetRequestSelector gets the facet request by id', () => {
    const facetId = '1';
    const state = createMockState();
    const facetRequest = buildFacetRequest({facetId});
    state.facetSet[facetId] = facetRequest;

    expect(facetRequestSelector(state, facetId)).toBe(facetRequest);
  });
});
