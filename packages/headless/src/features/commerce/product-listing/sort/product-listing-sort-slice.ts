import {getProductListingV2InitialState} from '../product-listing-state.js';
import {createReducer} from '@reduxjs/toolkit';
import {applySort} from './product-listing-sort-actions.js';

export const sortReducer = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder.addCase(applySort, (state, action) => {
      state.sort.appliedSort = action.payload;
    });
  }
);
