import {Action, AnyAction} from '@reduxjs/toolkit';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response';
import {buildMockCommerceRegularFacetValue} from '../../../test/mock-commerce-facet-value';
import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing';
import {buildMockSearch} from '../../../test/mock-search';
import {buildMockSearchResponse} from '../../../test/mock-search-response';
import {Parameters} from '../../commerce/parameters/parameters-actions';
import {restoreProductListingParameters} from '../../commerce/product-listing-parameters/product-listing-parameters-actions';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions';
import {restoreSearchParameters} from '../../commerce/search-parameters/search-parameters-actions';
import {executeSearch as executeCommerceSearch} from '../../commerce/search/search-actions';
import {change} from '../../history/history-actions';
import {getHistoryInitialState} from '../../history/history-state';
import {executeSearch} from '../../search/search-actions';
import {facetOrderReducer} from './facet-order-slice';
import {FacetOrderState, getFacetOrderInitialState} from './facet-order-state';

describe('facet-order slice', () => {
  let state: FacetOrderState;

  function dispatchMock(action: AnyAction) {
    state = facetOrderReducer(state, action);
  }

  function dispatchMockSearch(facetIds: string[]) {
    dispatchMock(
      executeSearch.fulfilled(
        buildMockSearch({
          response: buildMockSearchResponse({
            facets: facetIds.map((facetId) =>
              buildMockFacetResponse({facetId})
            ),
          }),
        }),
        '',
        {legacy: null as never}
      )
    );
  }

  function dispatchMockHistoryChange(facetIds: string[]) {
    dispatchMock(
      change.fulfilled(
        {...getHistoryInitialState(), facetOrder: facetIds},
        '',
        null as never
      )
    );
  }

  beforeEach(() => {
    state = getFacetOrderInitialState();
  });

  it('initializes the state correctly', () => {
    expect(facetOrderReducer(undefined, {type: ''})).toEqual([]);
  });

  it('saves the facet order when a search is successful', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockSearch(facetIds);
    expect(state).toEqual(facetIds);
  });

  it('restores the facet order when moving through the history', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockHistoryChange(facetIds);
    expect(state).toEqual(facetIds);
  });

  describe.each([
    {
      actionName: '#fetchProductListing.fulfilled',
      action: fetchProductListing.fulfilled,
      responseBuilder: buildFetchProductListingResponse,
    },
    {
      actionName: '#executeCommerceSearch.fulfilled',
      action: executeCommerceSearch.fulfilled,
      responseBuilder: buildSearchResponse,
    },
  ])('$actionName', ({action, responseBuilder}) => {
    function buildQueryAction(facetIds: string[]) {
      const facetValue = buildMockCommerceRegularFacetValue({
        value: 'some-value',
      });
      const response = responseBuilder();
      response.response.facets = facetIds.map((facetId) =>
        buildMockCommerceRegularFacetResponse({
          facetId,
          values: [facetValue],
        })
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return action(response as any, '');
    }

    it('saves the facet order when a query is successful', () => {
      const facetIds = ['facetA', 'facetB'];
      dispatchMock(buildQueryAction(facetIds));
      expect(state).toEqual(facetIds);
    });
  });

  describe.each([
    {
      actionName: '#restoreSearchParameters',
      action: restoreSearchParameters,
    },
    {
      actionName: '#restoreProductListingParameters',
      action: restoreProductListingParameters,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ])('$actionName', ({action}: {action: (payload: any) => Action}) => {
    it('sets the facet order to the facets in the parameters', () => {
      const payload: Parameters = {
        f: {
          regular_facet_1: [],
          regular_facet_2: [],
        },
        nf: {
          numeric_facet_1: [],
          numeric_facet_2: [],
        },
        df: {
          date_facet_1: [],
          date_facet_2: [],
        },
        cf: {
          category_facet_1: [],
          category_facet_2: [],
        },
      };

      dispatchMock(action(payload));
      expect(state).toEqual([
        'regular_facet_1',
        'regular_facet_2',
        'numeric_facet_1',
        'numeric_facet_2',
        'date_facet_1',
        'date_facet_2',
        'category_facet_1',
        'category_facet_2',
      ]);
    });
  });
});
