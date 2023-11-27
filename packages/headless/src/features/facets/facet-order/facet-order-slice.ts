import {createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from '../../commerce/product-listing/product-listing-actions';
import {change} from '../../history/history-actions';
import {executeSearch} from '../../search/search-actions';
import {getFacetOrderInitialState} from './facet-order-state';

export const facetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (_, action) => {
        return action.payload.response.facets.map((facet) => facet.facetId);
      })
      .addCase(fetchProductListing.fulfilled, (_, action) => {
        const generateFacetId = (facet: {facetId?: string; field: string}) =>
          facet.facetId ?? facet.field;
        return action.payload.response.facets.map(generateFacetId);
      })
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      });
  }
);
