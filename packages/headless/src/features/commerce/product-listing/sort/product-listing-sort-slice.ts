import {getProductListingV2InitialState} from '../product-listing-state';
import {createReducer} from '@reduxjs/toolkit';
import {applySort} from './product-listing-sort-actions';

export const sortReducer = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder.addCase(applySort, (state, action) => {
      state.sort.appliedSort = action.payload;
    });
  }
);
