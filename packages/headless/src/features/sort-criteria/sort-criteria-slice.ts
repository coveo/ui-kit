import {createReducer} from '@reduxjs/toolkit';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';

import {change} from '../history/history-actions';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const sortCriteriaReducer = createReducer(
  getSortCriteriaInitialState(),
  (builder) => {
    builder
      .addCase(registerSortCriterion, (_, action) => action.payload.expression)
      .addCase(updateSortCriterion, (_, action) => action.payload.expression)
      .addCase(change.fulfilled, (_, action) => action.payload.sortCriteria);
  }
);
