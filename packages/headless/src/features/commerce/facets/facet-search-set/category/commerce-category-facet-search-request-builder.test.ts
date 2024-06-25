import {Relay, createRelay} from '@coveo/relay';
import * as Actions from '../../../../../features/commerce/common/actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {buildMockFacetSearchRequestOptions} from '../../../../../test/mock-facet-search-request-options';
import {CategoryFacetValueRequest} from '../../facet-set/interfaces/request';
import {buildCategoryFacetSearchRequest} from './commerce-category-facet-search-request-builder';

describe('#buildCategoryFacetSearchRequest', () => {
  let state: CommerceAppState;
  let relay: Relay;
  let facetId: string;
  let query: string;
  let buildCommerceAPIRequestMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    facetId = '1';
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

    relay = createRelay({token: 'token', url: 'url', trackingId: 'trackingId'});
  });

  it('returned object has a #facetId property whose value is the passed facet ID argument', async () => {
    const request = await buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      relay
    );

    expect(request.facetId).toBe(facetId);
  });

  it('returned object has a #facetQuery property whose value is the facet query from state between wildcard characters', async () => {
    const request = await buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      relay
    );

    expect(request.facetQuery).toBe(
      `*${state.categoryFacetSearchSet[facetId].options.query}*`
    );
  });

  describe('returned object #ignorePaths property', () => {
    it('when the facet request has no selected value, is an empty array', async () => {
      const request = await buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        relay
      );

      expect(request.ignorePaths).toStrictEqual([]);
    });

    it('when the facet request has a selected value with no ancestry, is an array with a single array containing the selected value', async () => {
      state.commerceFacetSet[facetId].request.values[0] =
        buildMockCategoryFacetValue({state: 'selected', value: 'test'});
      const request = await buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        relay
      );

      expect(request.ignorePaths).toStrictEqual([
        [
          (
            state.commerceFacetSet[facetId].request
              .values[0] as CategoryFacetValueRequest
          ).value,
        ],
      ]);
    });

    it('when the facet request has a selected value with ancestry, is an array with a single array containing the selected value and its ancestors', async () => {
      state.commerceFacetSet[facetId].request.values[0] =
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
      const request = await buildCategoryFacetSearchRequest(
        facetId,
        state,
        false,
        relay
      );

      expect(request.ignorePaths).toStrictEqual([
        [
          (
            state.commerceFacetSet[facetId].request
              .values[0] as CategoryFacetValueRequest
          ).value,
          (
            state.commerceFacetSet[facetId].request
              .values[0] as CategoryFacetValueRequest
          ).children[0].value,
          (
            state.commerceFacetSet[facetId].request
              .values[0] as CategoryFacetValueRequest
          ).children[0].children[0].value,
        ],
      ]);
    });
  });

  it('when not building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest, plus the #query property', async () => {
    const buildCommerceAPIRequestMock = jest.spyOn(
      Actions,
      'buildCommerceAPIRequest'
    );

    const request = await buildCategoryFacetSearchRequest(
      facetId,
      state,
      false,
      relay
    );

    expect(request).toEqual({
      ...(await buildCommerceAPIRequestMock.mock.results[0].value),
      facetId,
      facetQuery: `*${query}*`,
      ignorePaths: [],
      query: state.commerceQuery?.query,
    });
  });

  it('when building a field suggestion request, returned request includes all properties returned by #buildCommerceAPIRequest except the #facets, #page, and #sort properties', async () => {
    const request = await buildCategoryFacetSearchRequest(
      facetId,
      state,
      true,
      relay
    );

    const {facets, page, sort, ...expectedBaseRequest} =
      await buildCommerceAPIRequestMock.mock.results[0].value;

    expect(request).toEqual({
      ...expectedBaseRequest,
      facetId,
      facetQuery: `*${query}*`,
      ignorePaths: [],
    });
  });
});
