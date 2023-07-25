import {createReducer} from '@reduxjs/toolkit';
import {
  getBadge,
  getRecs,
  setLocale,
  setPlacementContext,
  setSkus,
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
      .addCase(setPlacementContext, (state, action) => {
        state.skus = {
          cart: action.payload.cart,
          order: action.payload.order,
          plp: action.payload.plp,
          product: action.payload.product ?? undefined,
          recs: action.payload.recs,
          search: action.payload.search,
        };
        state.view = {
          currency: state.view.currency,
          locale: state.view.locale,
          type: action.payload.type ?? '',
          subtype: action.payload.subtype,
        };
      })
      .addCase(setSkus, (state, action) => {
        state.skus = {
          cart: action.payload.cart,
          order: action.payload.order,
          plp: action.payload.plp,
          product: action.payload.product ?? undefined,
          recs: action.payload.recs,
          search: action.payload.search,
        };
      })
      .addCase(setLocale, (state, action) => {
        state.view = {
          currency: action.payload.currency,
          locale: action.payload.locale,
          type: state.view.type,
          subtype: state.view.subtype,
        };
      })
      .addCase(setView, (state, action) => {
        state.view = {
          currency: state.view.currency,
          locale: state.view.locale,
          type: action.payload.type ?? '',
          subtype: action.payload.subtype,
        };
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
