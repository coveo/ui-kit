import {createReducer} from '@reduxjs/toolkit';
import {
  clearExpiredItems,
  fetchItemsFulfilled,
  fetchItemsPending,
  fetchItemsRejected,
  registerInstantItem,
  updateInstantItemQuery,
} from '../../instant-items/instant-items-slice';
import {fetchInstantProducts} from '../search/search-actions';
import {
  clearExpiredProducts,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions';
import {getInstantProductsInitialState} from './instant-products-state';

export const instantProductsReducer = createReducer(
  getInstantProductsInitialState(),
  (builder) => {
    builder.addCase(registerInstantProducts, (state, action) => {
      registerInstantItem(action.payload, state);
    });
    builder.addCase(updateInstantProductsQuery, (state, action) => {
      updateInstantItemQuery(action.payload, state);
    });
    builder.addCase(clearExpiredProducts, (state, action) => {
      clearExpiredItems(action.payload, state);
    });
    builder.addCase(fetchInstantProducts.pending, (state, action) => {
      fetchItemsPending(action.meta.arg, state, {results: []});
    });
    builder.addCase(fetchInstantProducts.fulfilled, (state, action) => {
      const {
        response: {
          products,
          responseId,
          pagination: {totalItems},
        },
      } = action.payload;
      fetchItemsFulfilled(
        {
          duration: 0,
          searchUid: responseId,
          totalCountFiltered: totalItems,
          ...action.meta.arg,
        },
        state,
        {
          products,
        }
      );
    });
    builder.addCase(fetchInstantProducts.rejected, (state, action) => {
      fetchItemsRejected(action.meta.arg, state);
    });
  }
);
