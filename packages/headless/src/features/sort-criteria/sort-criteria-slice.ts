import {createReducer} from '@reduxjs/toolkit';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';

import {change} from '../history/history-actions';
import {getSortCriteriaInitialState} from './sort-criteria-state';
import {buildCriterionExpression} from './criteria';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

export const sortCriteriaReducer = createReducer(
  getSortCriteriaInitialState(),
  (builder) => {
    builder
      .addCase(registerSortCriterion, (_, action) =>
        buildCriterionExpression(action.payload)
      )
      .addCase(updateSortCriterion, (_, action) =>
        buildCriterionExpression(action.payload)
      )
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.sortCriteria ?? state;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        return action.payload.sortCriteria ?? state;
      });
  }
);
