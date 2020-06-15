import {HeadlessState} from '../../state';
import {createSelector} from '@reduxjs/toolkit';

const firstResultSelector = (state: HeadlessState) =>
  state.pagination.firstResult;
const numberOfResultsSelector = (state: HeadlessState) =>
  state.pagination.numberOfResults;

export const pageSelector = createSelector(
  firstResultSelector,
  numberOfResultsSelector,
  (firstResult, numberOfResults) => firstResult / numberOfResults + 1
);
