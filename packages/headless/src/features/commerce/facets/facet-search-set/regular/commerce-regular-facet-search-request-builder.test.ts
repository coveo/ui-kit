import {MockInstance} from 'vitest';
import {NavigatorContext} from '../../../../../app/navigatorContextProvider.js';
import * as Actions from '../../../../../features/commerce/common/filterable-commerce-api-request-builder.js';
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
  let buildFilterableCommerceAPIRequestMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    facetId = '1';
    query = 'test';
    state = buildMockCommerceState();
    state.commerceQuery.query = 'test query';
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query},
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

  it('returned object has a #facetQuery property whose value is the facet query from state between wildcard characters', () => {
    const request = buildFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request.facetQuery).toBe(
      `*${state.facetSearchSet[facetId].options.query}*`
    );
  });

  it('when not building a field suggestion request, returned request includes all properties returned by #buildFilterableCommerceAPIRequest, plus the #query property', () => {
    const buildFilterableCommerceAPIRequestMock = vi.spyOn(
      Actions,
      'buildFilterableCommerceAPIRequest'
    );

    const request = buildFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request).toEqual({
      ...buildFilterableCommerceAPIRequestMock.mock.results[0].value,
      facetId,
      facetQuery: `*${query}*`,
      query: 'test query',
    });
  });

  it('when building a field suggestion request, returned request includes all properties returned by #buildFilterableCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
    const request = buildFacetSearchRequest(
      facetId,
      state,
      true,
      navigatorContext
    );

    const {facets, page, sort, ...expectedBaseRequest} =
      buildFilterableCommerceAPIRequestMock.mock.results[0].value;

    expect(request).toEqual({
      ...expectedBaseRequest,
      facetId,
      query: 'test query',
      facetQuery: `*${query}*`,
    });
  });
});
