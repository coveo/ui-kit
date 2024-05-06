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
    builder
      .addCase(registerInstantProducts, (state, action) => {
        registerInstantItem(action.payload, state);
      })
      .addCase(updateInstantProductsQuery, (state, action) => {
        updateInstantItemQuery(
          {...action.payload, q: action.payload.query},
          state
        );
      })
      .addCase(clearExpiredProducts, (state, action) => {
        clearExpiredItems(action.payload, state);
      })
      .addCase(fetchInstantProducts.pending, (state, action) => {
        fetchItemsPending(action.meta.arg, state, {products: []});
      })
      .addCase(fetchInstantProducts.fulfilled, (state, action) => {
        const {
          response: {
            products,
            responseId,
            pagination: {totalEntries},
          },
        } = action.payload;
        fetchItemsFulfilled(
          {
            duration: 0,
            searchUid: responseId,
            totalCountFiltered: totalEntries,
            ...action.meta.arg,
          },
          state,
          {
            products,
          }
        );
      })
      .addCase(fetchInstantProducts.rejected, (state, action) => {
        fetchItemsRejected(action.meta.arg, state);
      });
  }
);
