import {createReducer} from '@reduxjs/toolkit';
import {nextPage, previousPage, selectPage} from './pagination-actions';
import {getPaginationInitialState} from './pagination-state';

export const paginationReducer = createReducer(
  getPaginationInitialState(),
  (builder) => {
    builder
      .addCase(nextPage, (state) => {
        state.page += 1;
      })
      .addCase(previousPage, (state) => {
        state.page -= 1;
      })
      .addCase(selectPage, (state, action) => {
        state.page = action.payload;
      });
  }
);
