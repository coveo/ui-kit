import {createReducer} from '@reduxjs/toolkit';
import {updateQuery} from './query-actions';
import {getCommerceQueryInitialState} from './query-state';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions';

export const queryReducer = createReducer(
  getCommerceQueryInitialState(),

  (builder) => {
    builder
      .addCase(updateQuery, (state, action) => ({
        ...state,
        ...action.payload,
      }))
      .addCase(restoreSearchParameters, (state, action) => {
        state.query = action.payload.q ?? '';
      });
  }
);
