import {createSelector} from '@reduxjs/toolkit';
import type {SortCriteriaState} from './sort-criteria-state.js';

export const selectSortCriteria = createSelector(
  (state: {sortCriteria?: SortCriteriaState}) => state.sortCriteria,
  (sortCriteria) => sortCriteria
);
