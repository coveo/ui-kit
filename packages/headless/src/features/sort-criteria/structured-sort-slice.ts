import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

import {getStructuredSortInitialState} from './structured-sort-state';
import {parseCriterionExpression} from './criteria-parser';

export const structuredSortReducer = createReducer(
  getStructuredSortInitialState(),
  (builder) => {
    builder
      .addCase(registerSortCriterion, (_, action) => action.payload)
      .addCase(updateSortCriterion, (_, action) => action.payload)
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.sort ?? state;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        return action.payload?.sortCriteria
          ? parseCriterionExpression(action.payload.sortCriteria)
          : state;
      });
  }
);
