import type {PaginationSection} from '../../state/state-sections.js';
import {minimumPage} from './pagination-constants.js';
import {calculateMaxPage, calculatePage} from './pagination-slice.js';

interface Range {
  start: number;
  end: number;
}

function firstResultSelector(state: PaginationSection) {
  return state.pagination.firstResult;
}

function numberOfResultsSelector(state: PaginationSection) {
  return state.pagination.numberOfResults;
}

function totalCountFilteredSelector(state: PaginationSection) {
  return state.pagination.totalCountFiltered;
}

/** Calculates the current page number.
 * @param state SearchPageState.
 * @returns the current page number.
 */
export const currentPageSelector = (state: PaginationSection) => {
  const firstResult = firstResultSelector(state);
  const numberOfResults = numberOfResultsSelector(state);
  return calculatePage(firstResult, numberOfResults);
};

/** Calculates the maximum page number
 * @param state SearchPageState.
 * @returns the maximum page number.
 */
export const maxPageSelector = (state: PaginationSection) => {
  const totalCountFiltered = totalCountFilteredSelector(state);
  const numberOfResults = numberOfResultsSelector(state);
  return calculateMaxPage(totalCountFiltered, numberOfResults);
};

/** Calculates the current pages relative to the current page.
 * @param state SearchPageState.
 * @param desiredNumberOfPages the number of pages to return.
 * @returns the current page numbers.
 */
export const currentPagesSelector = (
  state: PaginationSection,
  desiredNumberOfPages: number
) => {
  const page = currentPageSelector(state);
  const maxPage = maxPageSelector(state);

  let range = buildRange(page, desiredNumberOfPages);
  range = shiftRightIfNeeded(range);
  range = shiftLeftIfNeeded(range, maxPage);
  return buildCurrentPages(range);
};

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
