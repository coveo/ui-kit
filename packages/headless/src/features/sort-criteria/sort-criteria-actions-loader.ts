import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {sortCriteriaReducer as sortCriteria} from '../../features/sort-criteria/sort-criteria-slice';
import {SortCriterion} from './criteria';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';

/**
 * The sort criteria action creators.
 */
export interface SortCriteriaActionCreators {
  /**
   * Initializes the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/13#operation/searchUsingPost-sortCriteria).
   *
   * @param criterion - The initial sort criterion.
   * @returns A dispatchable action.
   */
  registerSortCriterion(
    criterion: SortCriterion | SortCriterion[]
  ): PayloadAction<SortCriterion | SortCriterion[]>;

  /**
   * Updates the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/13#operation/searchUsingPost-sortCriteria).
   *
   * @param criterion - The sort criterion to set.
   * @returns A dispatchable action.
   */
  updateSortCriterion(
    criterion: SortCriterion | SortCriterion[]
  ): PayloadAction<SortCriterion | SortCriterion[]>;
}

/**
 * Loads the `sortCriteria` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSortCriteriaActions(
  engine: SearchEngine
): SortCriteriaActionCreators {
  engine.addReducers({sortCriteria});

  return {
    registerSortCriterion,
    updateSortCriterion,
  };
}
