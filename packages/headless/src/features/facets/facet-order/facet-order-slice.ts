import {type AnyAction, createReducer} from '@reduxjs/toolkit';
import {setContext, setView} from '../../commerce/context/context-actions.js';
import type {Parameters} from '../../commerce/parameters/parameters-actions.js';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../../commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {executeSearch as executeCommerceSearch} from '../../commerce/search/search-actions.js';
import {restoreSearchParameters} from '../../commerce/search-parameters/search-parameters-actions.js';
import {change} from '../../history/history-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import {
  type FacetOrderState,
  getFacetOrderInitialState,
} from './facet-order-state.js';

export const facetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, handleQueryFulfilled)
      .addCase(fetchProductListing.fulfilled, handleQueryFulfilled)
      .addCase(executeCommerceSearch.fulfilled, handleQueryFulfilled)
      .addCase(restoreSearchParameters, handleRestoreParameters)
      .addCase(restoreProductListingParameters, handleRestoreParameters)
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      })
      .addCase(setView, () => getFacetOrderInitialState())
      .addCase(setContext, () => getFacetOrderInitialState());
  }
);

function handleQueryFulfilled(_: FacetOrderState, action: AnyAction) {
  return action.payload.response.facets.map(
    (facet: {facetId: string}) => facet.facetId
  );
}

function handleRestoreParameters(
  _: FacetOrderState,
  action: {payload: Parameters}
) {
  return [
    ...Object.keys(action.payload.f ?? {}),
    ...Object.keys(action.payload.lf ?? {}),
    ...Object.keys(action.payload.nf ?? {}),
    ...Object.keys(action.payload.df ?? {}),
    ...Object.keys(action.payload.cf ?? {}),
    ...Object.keys(action.payload.mnf ?? {}),
  ];
}
