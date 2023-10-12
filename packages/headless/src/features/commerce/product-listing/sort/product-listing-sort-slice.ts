import {ProductListingV2State, getProductListingV2InitialState} from '../product-listing-state.js';
import {Reducer, createReducer} from '@reduxjs/toolkit';
import {applySort} from './product-listing-sort-actions.js';

export const sortReducer: Reducer<ProductListingV2State> = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder.addCase(applySort, (state, action) => {
      state.sort.appliedSort = action.payload;
    });
  }
);
