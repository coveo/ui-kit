import {createReducer} from '@reduxjs/toolkit';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';
import {buildRelevanceSortCriterion} from './criteria';
import {change} from '../history/history-actions';

export type SortCriteriaState = string;

export function getSortCriteriaInitialState(): SortCriteriaState {
  return buildRelevanceSortCriterion().expression;
}

export const sortCriteriaReducer = createReducer(
  getSortCriteriaInitialState(),
  (builder) => {
    builder
      .addCase(registerSortCriterion, (_, action) => action.payload.expression)
      .addCase(updateSortCriterion, (_, action) => action.payload.expression)
      .addCase(change.fulfilled, (_, action) => action.payload.sortCriteria);
  }
);
