import {NavigatorContext} from '../../../../../app/navigatorContextProvider';
import * as Actions from '../../../../../features/commerce/common/actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options';
import {buildMockNavigatorContextProvider} from '../../../../../test/mock-navigator-context-provider';
import {buildFacetSearchRequest} from './commerce-regular-facet-search-request-builder';

describe('#buildFacetSearchRequest', () => {
  let state: CommerceAppState;
  let navigatorContext: NavigatorContext;
  let facetId: string;
  let query: string;
  let buildCommerceAPIRequestMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    facetId = '1';
    query = 'test';
    state = buildMockCommerceState();
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query},
    });

    buildCommerceAPIRequestMock = jest.spyOn(
      Actions,
      'buildCommerceAPIRequest'
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

  it('when not building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest, plus the #query property', () => {
    const buildCommerceAPIRequestMock = jest.spyOn(
      Actions,
      'buildCommerceAPIRequest'
    );

    const request = buildFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request).toEqual({
      ...buildCommerceAPIRequestMock.mock.results[0].value,
      facetId,
      facetQuery: `*${query}*`,
      query: state.commerceQuery?.query,
    });
  });

  it('when building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
    const request = buildFacetSearchRequest(
      facetId,
      state,
      true,
      navigatorContext
    );

    const {facets, page, sort, ...expectedBaseRequest} =
      buildCommerceAPIRequestMock.mock.results[0].value;

    expect(request).toEqual({
      ...expectedBaseRequest,
      facetId,
      facetQuery: `*${query}*`,
    });
  });
});
