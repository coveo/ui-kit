import {NavigatorContext} from '../../../../../app/navigatorContextProvider';
import * as Actions from '../../../../../features/commerce/common/actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options';
import {buildMockNavigatorContextProvider} from '../../../../../test/mock-navigator-context-provider';
import {CategoryFacetValueRequest} from '../../facet-set/interfaces/request';
import {
  getFacetIdWithCommerceFieldSuggestionNamespace,
  getFacetIdWithoutCommerceFieldSuggestionNamespace,
} from '../commerce-facet-search-actions';
import {buildCategoryFacetSearchRequest} from './commerce-category-facet-search-request-builder';

describe('#buildCategoryFacetSearchRequest', () => {
  let state: CommerceAppState;
  let navigatorContext: NavigatorContext;
  const facetId = '1';
  let query: string;
  let buildCommerceAPIRequestMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    query = 'test';
    state = buildMockCommerceState();

    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch({
      options: {...buildMockFacetSearchRequestOptions(), query},
    });

    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({type: 'hierarchical'}),
    });

    buildCommerceAPIRequestMock = jest.spyOn(
      Actions,
      'buildCommerceAPIRequest'
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

  it('when not building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest, plus the #query property', () => {
    const buildCommerceAPIRequestMock = jest.spyOn(
      Actions,
      'buildCommerceAPIRequest'
    );

    const request = buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      navigatorContext
    );

    expect(request).toEqual({
      ...buildCommerceAPIRequestMock.mock.results[0].value,
      facetId,
      facetQuery: `*${query}*`,
      ignorePaths: [],
      query: state.commerceQuery?.query,
    });
  });

  it('when building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest except the #facets, #page, and #sort properties', () => {
    const request = buildCategoryFacetSearchRequest(
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
      ignorePaths: [],
      query: '',
    });
  });
});
