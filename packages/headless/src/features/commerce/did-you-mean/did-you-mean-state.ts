import type {QueryCorrection} from '../../../api/search/search/query-corrections.js';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state.js';

export interface DidYouMeanState {
  /**
   * The correction that was automatically applied to the query. If no correction was automatically applied, will default to an empty string.
   */
  wasCorrectedTo: string;
  /**
   * The query correction that was returned by the "did you mean" feature.
   */
  queryCorrection: QueryCorrection;
  /**
   * The original query expression that was received.
   */
  originalQuery: string;
}

export function getDidYouMeanInitialState(): DidYouMeanState {
  return {
    wasCorrectedTo: '',
    queryCorrection: emptyNextCorrection(),
    originalQuery: '',
  };
}
