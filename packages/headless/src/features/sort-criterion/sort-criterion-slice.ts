import {createReducer} from '@reduxjs/toolkit';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criterion-actions';

export type SortCriteriaState = string;

export function getSortCriteriaInitialState(): SortCriteriaState {
  return '';
}

export const sortCriteriaReducer = createReducer(
  getSortCriteriaInitialState(),
  (builder) => {
    builder
      .addCase(registerSortCriterion, (state, action) =>
        state ? state : action.payload.expression
      )
      .addCase(updateSortCriterion, (_, action) => action.payload.expression);
  }
);
