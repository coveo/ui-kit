import {HeadlessState} from '../../state';
import {createSelector} from '@reduxjs/toolkit';
import {calculatePage, calculateMaxPage, minimumPage} from './pagination-slice';

interface Range {
  start: number;
  end: number;
}

function firstResultSelector(state: HeadlessState) {
  return state.pagination.firstResult;
}

function numberOfResultsSelector(state: HeadlessState) {
  return state.pagination.numberOfResults;
}

function totalCountFilteredSelector(state: HeadlessState) {
  return state.pagination.totalCountFiltered;
}

/** Calculates the current page number.
 * @param state HeadlessState.
 * @returns the current page number.
 */
export const currentPageSelector = createSelector(
  firstResultSelector,
  numberOfResultsSelector,
  calculatePage
);

/** Calculates the maximum page number
 * @param state HeadlessState.
 * @returns the maximum page number.
 */
export const maxPageSelector = createSelector(
  totalCountFilteredSelector,
  numberOfResultsSelector,
  calculateMaxPage
);

/** Calculates the current pages relative to the current page.
 * @param state HeadlessState.
 * @param desiredNumberOfPages the number of pages to return.
 * @returns the current page numbers.
 */
export const currentPagesSelector = createSelector(
  currentPageSelector,
  maxPageSelector,
  (_: HeadlessState, desiredNumberOfPages: number) => desiredNumberOfPages,
  (page, maxPage, desiredNumberOfPages) => {
    let range = buildRange(page, desiredNumberOfPages);
    range = shiftRightIfNeeded(range);
    range = shiftLeftIfNeeded(range, maxPage);
    return buildCurrentPages(range);
  }
);

function buildRange(page: number, desiredNumberOfPages: number): Range {
  const isEven = desiredNumberOfPages % 2 === 0;
  const leftCapacity = Math.floor(desiredNumberOfPages / 2);
  const rightCapacity = isEven ? leftCapacity - 1 : leftCapacity;

  const start = page - leftCapacity;
  const end = page + rightCapacity;

  return {start, end};
}

function shiftRightIfNeeded(range: Range) {
  const leftExcess = Math.max(minimumPage - range.start, 0);
  const start = range.start + leftExcess;
  const end = range.end + leftExcess;

  return {start, end};
}

function shiftLeftIfNeeded(range: Range, maxPage: number) {
  const rightExcess = Math.max(range.end - maxPage, 0);
  const start = Math.max(range.start - rightExcess, minimumPage);
  const end = range.end - rightExcess;

  return {start, end};
}

function buildCurrentPages(range: Range) {
  const currentPages: number[] = [];

  for (let counter = range.start; counter <= range.end; ++counter) {
    currentPages.push(counter);
  }

  return currentPages;
}
