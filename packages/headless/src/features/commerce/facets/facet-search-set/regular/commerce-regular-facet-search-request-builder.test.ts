import type {MockInstance} from 'vitest';
import type {CommerceFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import * as Actions from '../../../../../features/commerce/common/filterable-commerce-api-request-builder.js';
import type {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options.js';
import {buildMockNavigatorContextProvider} from '../../../../../test/mock-navigator-context-provider.js';
import {buildFacetSearchRequest} from './commerce-regular-facet-search-request-builder.js';

describe('#buildFacetSearchRequest', () => {
  let state: CommerceAppState;
  let navigatorContext: NavigatorContext;
  let facetId: string;
  let query: string;
  let numberOfValues: number;
  let buildFilterableCommerceAPIRequestMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    facetId = '1';
    query = 'test';
    numberOfValues = 5;
    state = buildMockCommerceState();
    state.commerceQuery.query = query;
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query, numberOfValues},
    });

    buildFilterableCommerceAPIRequestMock = vi.spyOn(
      Actions,
      'buildFilterableCommerceAPIRequest'
    );

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

    it('returned request includes all properties returned by #buildFilterableCommerceAPIRequest', () => {
      expect(request).toEqual({
        ...buildFilterableCommerceAPIRequestMock.mock.results[0].value,
        facetId,
        facetQuery: `*${query}*`,
        query,
        numberOfValues,
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

    it('returned request includes all properties returned by #buildFilterableCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
      const {
        facets: _facets,
        page: _page,
        sort: _sort,
        ...expectedBaseRequest
      } = buildFilterableCommerceAPIRequestMock.mock.results[0].value;

      expect(request).toEqual({
        ...expectedBaseRequest,
        facetId,
        facetQuery: '*',
        query,
        numberOfValues,
      });
    });
  });
});
