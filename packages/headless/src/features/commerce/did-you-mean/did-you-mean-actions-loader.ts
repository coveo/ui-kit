import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {applyCorrection} from './did-you-mean-actions.js';
import {didYouMeanReducer} from './did-you-mean-slice.js';

/**
 * The Commerce DidYouMean action creators.
 */
export interface DidYouMeanActionCreators {
  /**
   * Applies a did-you-mean correction.
   *
   * @param correction - The target correction (e.g., "corrected string").
   * @returns A dispatchable action.
   */
  applyCorrection: (correction: string) => PayloadAction<string>;
}

/**
 * Loads the commerce did you mean reducer and returns the available did you mean action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the did you mean action creators.
 */
export function loadDidYouMeanActions(
  engine: CommerceEngine
): DidYouMeanActionCreators {
  engine.addReducers({didYouMeanReducer});
  return {
    applyCorrection,
  };
}
