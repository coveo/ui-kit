import {AnyAction, createReducer} from '@reduxjs/toolkit';
import {setContext, setView} from '../../commerce/context/context-actions';
import {Parameters} from '../../commerce/parameters/parameters-actions';
import {restoreProductListingParameters} from '../../commerce/product-listing-parameters/product-listing-parameters-actions';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions';
import {restoreSearchParameters} from '../../commerce/search-parameters/search-parameters-actions';
import {executeSearch as executeCommerceSearch} from '../../commerce/search/search-actions';
import {change} from '../../history/history-actions';
import {executeSearch} from '../../search/search-actions';
import {FacetOrderState, getFacetOrderInitialState} from './facet-order-state';

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
    ...Object.keys(action.payload.nf ?? {}),
    ...Object.keys(action.payload.df ?? {}),
    ...Object.keys(action.payload.cf ?? {}),
    ...Object.keys(action.payload.mnf ?? {}),
  ];
}
