import {createReducer} from '@reduxjs/toolkit';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';

import {change} from '../history/history-actions';
import {getSortCriteriaInitialState} from './sort-criteria-state';
import {buildCriterionExpression} from './criteria';

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
      .addCase(change.fulfilled, (_, action) => action.payload.sortCriteria);
  }
);
