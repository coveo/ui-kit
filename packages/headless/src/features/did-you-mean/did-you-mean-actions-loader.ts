import {PayloadAction} from '@reduxjs/toolkit';
import {didYouMean, query} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  applyDidYouMeanCorrection,
  disableDidYouMean,
  enableDidYouMean,
} from './did-you-mean-actions';

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
  };
}
