import {type AnyAction, createReducer} from '@reduxjs/toolkit';
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

export const commerceFacetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, handleQueryFulfilled)
      .addCase(executeCommerceSearch.fulfilled, handleQueryFulfilled)
      .addCase(restoreSearchParameters, handleRestoreParameters)
      .addCase(restoreProductListingParameters, handleRestoreParameters)
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
