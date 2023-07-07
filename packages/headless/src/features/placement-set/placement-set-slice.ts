import {createReducer} from '@reduxjs/toolkit';
import {getBadge, getRecs} from './placement-set-action';
import {
  getBadgesInitialState,
  getPlacementSetInitialState,
  getRecsInitialState,
} from './placement-set-state';

export const placementSetReducer = createReducer(
  getPlacementSetInitialState(),
  (builder) => {
    builder
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
        state.recs[action.payload.placementId] = action.payload;
      })
      .addCase(getRecs.rejected, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.recs[action.payload.placementId] = {
          error: action.payload,
          ...getRecsInitialState(),
        };
      });
  }
);
