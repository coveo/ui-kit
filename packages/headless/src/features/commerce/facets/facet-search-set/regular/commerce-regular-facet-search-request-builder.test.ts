import {MockInstance} from 'vitest';
import {CommerceFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import {NavigatorContext} from '../../../../../app/navigatorContextProvider.js';
import * as Actions from '../../../../../features/commerce/common/actions.js';
import {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {buildMockNavigatorContextProvider} from '../../../../../test/mock-navigator-context-provider.js';
import {buildFacetSearchRequest} from './commerce-regular-facet-search-request-builder.js';

describe('#buildFacetSearchRequest', () => {
  let state: CommerceAppState;
  let navigatorContext: NavigatorContext;
  let facetId: string;
  let query: string;
  let buildCommerceAPIRequestMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    facetId = '1';
    query = 'test';
    state = buildMockCommerceState();
    state.commerceQuery.query = query;
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query},
    });

    buildCommerceAPIRequestMock = vi.spyOn(Actions, 'buildCommerceAPIRequest');

    navigatorContext = buildMockNavigatorContextProvider()();
  });

  it('returned object has a #facetId property whose value is the passed facet ID argument', () => {
    const request = buildFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request.facetId).toBe(facetId);
  });

  describe('when not building a field suggestion request', () => {
    let request: CommerceFacetSearchRequest;

    beforeEach(() => {
      request = buildFacetSearchRequest(
        facetId,
        state,
        false,
        navigatorContext
      );
    });

    it('returned object has a #facetQuery property whose value is the facet query from state between wildcard characters', () => {
      expect(request.facetQuery).toBe(
        `*${state.facetSearchSet[facetId].options.query}*`
      );
    });

    it('returned request includes all properties returned by #buildCommerceAPIRequest', () => {
      expect(request).toEqual({
        ...buildCommerceAPIRequestMock.mock.results[0].value,
        facetId,
        facetQuery: `*${query}*`,
        query,
      });
    });
  });

  describe('when building a field suggestion request', () => {
    let request: CommerceFacetSearchRequest;
    beforeEach(() => {
      request = buildFacetSearchRequest(facetId, state, true, navigatorContext);
    });

    it('returned object has a #facetQuery property whose value is the wildcard character', () => {
      expect(request.facetQuery).toBe('*');
    });

    it('returned request includes all properties returned by #buildCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
      const {facets, page, sort, ...expectedBaseRequest} =
        buildCommerceAPIRequestMock.mock.results[0].value;

      expect(request).toEqual({
        ...expectedBaseRequest,
        facetId,
        facetQuery: '*',
        query,
      });
    });
  });
});
