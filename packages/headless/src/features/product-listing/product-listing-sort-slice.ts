import {createReducer} from '@reduxjs/toolkit';
import {getProductListingSortInitialState} from './product-listing-sort-state';
import {change} from '../history/history-actions';
import {
  registerProductListingSortCriterion,
  updateProductListingSortCriterion,
} from './product-listing-sort-actions';

export const productListingSortReducer = createReducer(
  getProductListingSortInitialState(),
  (builder) => {
    builder
      .addCase(
        registerProductListingSortCriterion,
        (_, action) => action.payload
      )
      .addCase(updateProductListingSortCriterion, (_, action) => action.payload)
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.productListingSort ?? state;
      });
  }
);
