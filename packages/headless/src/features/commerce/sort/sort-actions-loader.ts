import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {type ApplySortPayload, applySort} from './sort-actions.js';
import {sortReducer as commerceSort} from './sort-slice.js';

export type {ApplySortPayload};

/**
 * The sort action creators.
 *
 * @group Actions
 * @category Sort
 */
export interface SortActionCreators {
  /**
   * Applies a sort criterion.
   *
   * @param payload - The payload of the action.
   * @returns A dispatchable action.
   */
  applySort(payload: ApplySortPayload): PayloadAction<ApplySortPayload>;
}

/**
 * Loads the commerce sort reducer and returns the available sort action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the sort action creators.
 *
 * @group Actions
 * @category Sort
 */
export function loadSortActions(engine: CommerceEngine): SortActionCreators {
  engine.addReducers({commerceSort});
  return {
    applySort,
  };
}
