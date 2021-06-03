import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {pagination} from '../../app/reducers';
import {
  nextPage,
  previousPage,
  registerNumberOfResults,
  registerPage,
  updateNumberOfResults,
  updatePage,
} from './pagination-actions';

/**
 * The pagination action creators.
 */
export interface PaginationActionCreators {
  /**
   * Updates the page to the next page.
   *
   * @returns A dispatchable action.
   */
  nextPage(): PayloadAction;

  /**
   * Updates the page to the previous page.
   *
   * @returns A dispatchable action.
   */
  previousPage(): PayloadAction;

  /**
   * Initializes the `numberOfResults` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults).
   *
   * @param numberOfResults - The initial number of results.
   * @returns A dispatchable action.
   */
  registerNumberOfResults(numberOfResults: number): PayloadAction<number>;

  /**
   * Sets the initial page by initializing the `firstResult` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult).
   *
   * @param page - The initial page number.
   * @returns A dispatchable action.
   */
  registerPage(page: number): PayloadAction<number>;

  /**
   * Updates the `numberOfResults` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults).
   *
   * @param numberOfResults - The new number of results.
   * @returns A dispatchable action.
   */
  updateNumberOfResults(numberOfResults: number): PayloadAction<number>;

  /**
   * Updates the page by updating the `firstResult` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult).
   *
   * @param page - The new page number.
   * @returns A dispatchable action.
   */
  updatePage(page: number): PayloadAction<number>;
}

/**
 * Loads the `pagination` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadPaginationActions(
  engine: Engine<object>
): PaginationActionCreators {
  engine.addReducers({pagination});

  return {
    nextPage,
    previousPage,
    registerNumberOfResults,
    registerPage,
    updateNumberOfResults,
    updatePage,
  };
}
