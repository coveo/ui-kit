import {createReducer} from '@reduxjs/toolkit';
import {
  getBadge,
  getRecs,
  setCartSkus,
  setLocale,
  setOrderSkus,
  setPlpSkus,
  setProductSku,
  setRecsSkus,
  setSearchSkus,
  setView,
} from './placement-set-action';
import {
  getBadgesInitialState,
  getPlacementSetInitialState,
  getRecsInitialState,
} from './placement-set-state';

export const placementSetReducer = createReducer(
  getPlacementSetInitialState(),
  (builder) => {
    builder
      .addCase(setCartSkus, (state, action) => {
        state.skus.cart = action.payload.skus;
      })
      .addCase(setOrderSkus, (state, action) => {
        state.skus.order = action.payload.skus;
      })
      .addCase(setPlpSkus, (state, action) => {
        state.skus.plp = action.payload.skus;
      })
      .addCase(setProductSku, (state, action) => {
        state.skus.product = action.payload;
      })
      .addCase(setRecsSkus, (state, action) => {
        state.skus.recs = action.payload.skus;
      })
      .addCase(setSearchSkus, (state, action) => {
        state.skus.search = action.payload.skus;
      })
      .addCase(setLocale, (state, action) => {
        state.view.currency = action.payload.currency;
        state.view.locale = action.payload.locale;
      })
      .addCase(setView, (state, action) => {
        state.view.type = action.payload.type ?? '';
        state.view.subtype = action.payload.subtype;
        state.view.type !== 'category' ? (state.skus.plp = []) : {};
        state.view.type !== 'product' ? (state.skus.product = undefined) : {};
        state.view.type !== 'search' ? (state.skus.search = []) : {};
        state.view.type !== 'checkout' && state.view.type !== 'confirmation'
          ? (state.skus.order = [])
          : {};
      })
      .addCase(getBadge.fulfilled, (state, action) => {
        state.badges[action.payload.placementId] = action.payload;
      })
      .addCase(getBadge.rejected, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.badges[action.payload.placementId] = {
          error: action.payload,
          ...getBadgesInitialState(),
        };
      })
      .addCase(getRecs.fulfilled, (state, action) => {
        state.recommendations[action.payload.placementId] = action.payload;
      })
      .addCase(getRecs.rejected, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.recommendations[action.payload.placementId] = {
          error: action.payload,
          ...getRecsInitialState(),
        };
      });
  }
);
