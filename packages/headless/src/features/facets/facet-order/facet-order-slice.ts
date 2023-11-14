import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions';
import {executeSearch} from '../../search/search-actions';
import {getFacetOrderInitialState} from './facet-order-state';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions';

export const facetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (_, action) => {
        return action.payload.response.facets.map((facet) => facet.facetId);
      })
      .addCase(fetchProductListing.fulfilled, (_, action) => {
        return action.payload.response.facets.map((facet) => facet.field);
      })
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      });
  }
);
