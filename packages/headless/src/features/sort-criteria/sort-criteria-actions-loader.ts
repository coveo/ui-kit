import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {sortCriteria} from '../../app/reducers';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';
import {SortCriterion} from './criteria';

/**
 * The sort criteria action creators.
 */
export interface SortCriteriaActionCreators {
  /**
   * Initializes the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
   *
   * @param criterion - The initial sort criterion.
   * @returns A dispatchable action.
   */
  registerSortCriterion(
    criterion: SortCriterion | SortCriterion[]
  ): PayloadAction<SortCriterion | SortCriterion[]>;

  /**
   * Updates the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
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
  engine: Engine<object>
): SortCriteriaActionCreators {
  engine.addReducers({sortCriteria});

  return {
    registerSortCriterion,
    updateSortCriterion,
  };
}
