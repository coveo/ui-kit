import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {didYouMeanReducer as didYouMean} from '../../features/did-you-mean/did-you-mean-slice';
import {queryReducer as query} from '../../features/query/query-slice';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  disableDidYouMean,
  enableAutomaticQueryCorrection,
  enableDidYouMean,
  setCorrectionMode,
} from './did-you-mean-actions';
import {CorrectionMode} from './did-you-mean-state';

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

  /**
   * Sets the query correction mode.
   *
   * @param mode @param mode - The query correction mode to use. Must be either `"legacy"` (index based) or `"next"` (query suggestions based).
   * @returns A dispatchable action.
   *
   */
  setCorrectionMode(mode: CorrectionMode): PayloadAction<CorrectionMode>;
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
    setCorrectionMode,
  };
}
