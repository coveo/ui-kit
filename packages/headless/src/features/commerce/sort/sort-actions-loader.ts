import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ApplySortActionCreatorPayload, applySort} from './sort-actions';
import {sortReducer as commerceSort} from './sort-slice';

export type {ApplySortActionCreatorPayload};

/**
 * The sort action creators.
 *
 *  In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface SortActionCreators {
  /**
   * Applies a sort criterion.
   *
   * @param payload - The payload of the action.
   * @returns A dispatchable action.
   */
  applySort(
    payload: ApplySortActionCreatorPayload
  ): PayloadAction<ApplySortActionCreatorPayload>;
}

/**
 * Loads the commerce sort reducer and returns the available sort action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the sort action creators.
 */
export function loadSortActions(engine: CommerceEngine): SortActionCreators {
  engine.addReducers({commerceSort});
  return {
    applySort,
  };
}
