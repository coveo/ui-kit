import type {Action, AnyAction} from '@reduxjs/toolkit';
import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceRegularFacetValue} from '../../../test/mock-commerce-facet-value.js';
import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildMockFacetResponse} from '../../../test/mock-facet-response.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {buildMockSearch} from '../../../test/mock-search.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {setContext, setView} from '../../commerce/context/context-actions.js';
import type {Parameters} from '../../commerce/parameters/parameters-actions.js';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../../commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {executeSearch as executeCommerceSearch} from '../../commerce/search/search-actions.js';
import {restoreSearchParameters} from '../../commerce/search-parameters/search-parameters-actions.js';
import {change} from '../../history/history-actions.js';
import {getHistoryInitialState} from '../../history/history-state.js';
import {executeSearch} from '../../search/search-actions.js';
import {facetOrderReducer} from './facet-order-slice.js';
import {
  type FacetOrderState,
  getFacetOrderInitialState,
} from './facet-order-state.js';

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
  it('#setView restore the initial state', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockSearch(facetIds);
    expect(state).toEqual(facetIds);

    dispatchMock(setView);
    expect(state).toEqual(getFacetOrderInitialState());
  });

  it('#setContext (commerce) restore the initial state', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockSearch(facetIds);
    expect(state).toEqual(facetIds);

    dispatchMock(setContext);
    expect(state).toEqual(getFacetOrderInitialState());
  });
});
