import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {didYouMeanReducer as didYouMean} from '../../features/did-you-mean/did-you-mean-slice.js';
import {queryReducer as query} from '../../features/query/query-slice.js';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  disableDidYouMean,
  enableAutomaticQueryCorrection,
  enableDidYouMean,
} from './did-you-mean-actions.js';

/**
 * The DidYouMean action creators.
 */
export interface DidYouMeanActionCreators {
  /**
   * Applies a did-you-mean correction.
   *
   * @param correction - The target correction (e.g., "corrected string").
   * @returns A dispatchable action.
   */
  applyDidYouMeanCorrection(correction: string): PayloadAction<string>;

  /**
   * Disables did-you-mean.
   *
   * @returns A dispatchable action.
   */
  disableDidYouMean(): PayloadAction;

  /**
   * Enables automatic query correction
   *
   * @returns A dispatchable action.
   */
  enableAutomaticQueryCorrection(): PayloadAction;

  /**
   * Disables automatic query correction
   *
   * @returns A dispatchable action.
   */
  disableAutomaticQueryCorrection(): PayloadAction;

  /**
   * Enables did-you-mean.
   *
   * @returns A dispatchable action.
   */
  enableDidYouMean(): PayloadAction;
}

/**
 * Loads the `debug` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadDidYouMeanActions(
  engine: SearchEngine
): DidYouMeanActionCreators {
  engine.addReducers({didYouMean, query});

  return {
    applyDidYouMeanCorrection,
    disableDidYouMean,
    enableDidYouMean,
    enableAutomaticQueryCorrection,
    disableAutomaticQueryCorrection,
  };
}
