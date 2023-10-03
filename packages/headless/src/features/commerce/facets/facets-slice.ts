import {createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {getCommerceFacetsInitialState} from './facets-state';

export const facetsReducer = createReducer(
  getCommerceFacetsInitialState(),

  (builder) => {
    builder.addCase(fetchProductListing.fulfilled, (state, action) => {
      state.facets = action.payload.response.facets;
    });
  }
);
