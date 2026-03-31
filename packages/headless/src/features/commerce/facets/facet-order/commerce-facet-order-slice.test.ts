import type {Action, AnyAction} from '@reduxjs/toolkit';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value.js';
import {buildSearchResponse} from '../../../../test/mock-commerce-search.js';
import {buildFetchProductListingResponse} from '../../../../test/mock-product-listing.js';
import {
  type FacetOrderState,
  getFacetOrderInitialState,
} from '../../../facets/facet-order/facet-order-state.js';
import {setContext, setView} from '../../context/context-actions.js';
import type {Parameters} from '../../parameters/parameters-actions.js';
import {fetchProductListing} from '../../product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../../product-listing-parameters/product-listing-parameters-actions.js';
import {executeSearch as executeCommerceSearch} from '../../search/search-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameters-actions.js';
import {commerceFacetOrderReducer} from './commerce-facet-order-slice.js';

describe('commerce facet-order slice', () => {
  let state: FacetOrderState;

  function dispatchMock(action: AnyAction) {
    state = commerceFacetOrderReducer(state, action);
  }

  beforeEach(() => {
    state = getFacetOrderInitialState();
  });

  it('initializes the state correctly', () => {
    expect(commerceFacetOrderReducer(undefined, {type: ''})).toEqual([]);
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

      // biome-ignore lint/suspicious/noExplicitAny: <>
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
    // biome-ignore lint/suspicious/noExplicitAny: <>
  ])('$actionName', ({action}: {action: (payload: any) => Action}) => {
    it('sets the facet order to the facets in the parameters', () => {
      const payload: Parameters = {
        f: {
          regular_facet_1: [],
          regular_facet_2: [],
        },
        lf: {
          location_facet_1: [],
          location_facet_2: [],
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
        'location_facet_1',
        'location_facet_2',
        'numeric_facet_1',
        'numeric_facet_2',
        'date_facet_1',
        'date_facet_2',
        'category_facet_1',
        'category_facet_2',
      ]);
    });
  });

  it('#setView restores the initial state', () => {
    state = ['facetA', 'facetB'];
    dispatchMock(setView);
    expect(state).toEqual(getFacetOrderInitialState());
  });

  it('#setContext restores the initial state', () => {
    state = ['facetA', 'facetB'];
    dispatchMock(setContext);
    expect(state).toEqual(getFacetOrderInitialState());
  });
});
