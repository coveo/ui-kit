import {AnyAction, createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions';
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
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      });
  }
);

function handleQueryFulfilled(_: FacetOrderState, action: AnyAction) {
  return action.payload.response.facets.map(
    (facet: {facetId: string}) => facet.facetId
  );
}
