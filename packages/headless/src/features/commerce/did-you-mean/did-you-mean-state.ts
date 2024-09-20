import {QueryCorrection} from '../../../api/search/search/query-corrections.js';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state.js';

export interface DidYouMeanState {
  /**
   * The correction that was applied to the query. If no correction was applied, will default to an empty string.
   */
  wasCorrectedTo: string;
  /**
   * The query correction that is currently applied by the "did you mean" feature.
   */
  queryCorrection: QueryCorrection;
  /**
   * The original query expression that was received and automatically corrected.
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
