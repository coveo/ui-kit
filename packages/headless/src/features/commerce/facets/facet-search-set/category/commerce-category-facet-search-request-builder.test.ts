import type {MockInstance} from 'vitest';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import * as Actions from '../../../../../features/commerce/common/filterable-commerce-api-request-builder.js';
import type {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options.js';
import {buildMockNavigatorContextProvider} from '../../../../../test/mock-navigator-context-provider.js';
import type {CategoryFacetValueRequest} from '../../facet-set/interfaces/request.js';
import {
  getFacetIdWithCommerceFieldSuggestionNamespace,
  getFacetIdWithoutCommerceFieldSuggestionNamespace,
} from '../commerce-facet-search-actions.js';
import {buildCategoryFacetSearchRequest} from './commerce-category-facet-search-request-builder.js';

describe('#buildCategoryFacetSearchRequest', () => {
  let state: CommerceAppState;
  let navigatorContext: NavigatorContext;
  const facetId = '1';
  let query: string;
  let numberOfValues: number;
  let buildFilterableCommerceAPIRequestMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    query = 'test';
    numberOfValues = 5;
    state = buildMockCommerceState();

    state.commerceQuery.query = query;

    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query, numberOfValues},
    });

    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({type: 'hierarchical'}),
    });

    buildFilterableCommerceAPIRequestMock = vi.spyOn(
      Actions,
      'buildFilterableCommerceAPIRequest'
    );

    navigatorContext = buildMockNavigatorContextProvider()();
  });

  it('returned object has a #facetId property whose value is the passed facet ID argument', () => {
    const request = buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request.facetId).toBe(facetId);
  });

  it('returned object has a #facetQuery property whose value is the facet query from state between wildcard characters', () => {
    const request = buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request.facetQuery).toBe(
      `*${state.categoryFacetSearchSet[facetId].options.query}*`
    );
  });

  describe.each([
    {
      facetId: 'a_non_namespaced_facet_id',
    },
    {
      facetId: getFacetIdWithCommerceFieldSuggestionNamespace(
        'a_namespaced_facet_id'
      ),
    },
  ])('returned object #ignorePaths property', ({facetId}) => {
    beforeEach(() => {
      state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch({
        options: {...buildMockFacetSearchRequestOptions(), query},
      });

      state.commerceFacetSet[
        getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId)
      ] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({type: 'hierarchical'}),
      });
    });

    it('when the facet request has no selected value, is an empty array', () => {
      const request = buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        navigatorContext
      );

      expect(request.ignorePaths).toStrictEqual([]);
    });

    it('when the facet request has a selected value with no ancestry, is an array with a single array containing the selected value', () => {
      state.commerceFacetSet[
        getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId)
      ].request.values[0] = buildMockCategoryFacetValue({
        state: 'selected',
        value: 'test',
      });
      const request = buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        navigatorContext
      );

      expect(request.ignorePaths).toStrictEqual([
        [
          (
            state.commerceFacetSet[
              getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId)
            ].request.values[0] as CategoryFacetValueRequest
          ).value,
        ],
      ]);
    });

    it('when the facet request has a selected value with ancestry, is an array with a single array containing the selected value and its ancestors', () => {
      const nonNamespacedId =
        getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId);
      state.commerceFacetSet[nonNamespacedId].request.values[0] =
        buildMockCategoryFacetValue({
          value: 'test',
          children: [
            buildMockCategoryFacetValue({
              value: 'test2',
              children: [
                buildMockCategoryFacetValue({
                  state: 'selected',
                  value: 'test3',
                }),
              ],
            }),
          ],
        });
      const request = buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        navigatorContext
      );

      expect(request.ignorePaths).toStrictEqual([
        [
          (
            state.commerceFacetSet[nonNamespacedId].request
              .values[0] as CategoryFacetValueRequest
          ).value,
          (
            state.commerceFacetSet[nonNamespacedId].request
              .values[0] as CategoryFacetValueRequest
          ).children[0].value,
          (
            state.commerceFacetSet[nonNamespacedId].request
              .values[0] as CategoryFacetValueRequest
          ).children[0].children[0].value,
        ],
      ]);
    });
  });

  it('when not building a field suggestion request, returned request includes all properties returned by #buildFilterableCommerceAPIRequest, plus the #query property', () => {
    const buildFilterableCommerceAPIRequestMock = vi.spyOn(
      Actions,
      'buildFilterableCommerceAPIRequest'
    );

    const request = buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request).toEqual({
      ...buildFilterableCommerceAPIRequestMock.mock.results[0].value,
      facetId,
      facetQuery: `*${query}*`,
      ignorePaths: [],
      query,
      numberOfValues,
    });
  });

  it('when building a field suggestion request, returned request includes the #query, plus all properties returned by #buildCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
    const request = buildCategoryFacetSearchRequest(
      facetId,
      state,
      true,
      navigatorContext
    );

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
      ignorePaths: [],
      query: 'test',
      numberOfValues,
    });
  });
});
