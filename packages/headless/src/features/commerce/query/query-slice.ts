import {createReducer} from '@reduxjs/toolkit';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions';
import {updateQuery} from './query-actions';
import {getCommerceQueryInitialState} from './query-state';

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
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        state.query = action.payload.expression;
      });
  }
);
