import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {buildCriterionExpression} from './criteria.js';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions.js';
import {getSortCriteriaInitialState} from './sort-criteria-state.js';

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
