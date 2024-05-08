import {QueryCorrection} from '../../../api/search/search/query-corrections';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state';

export interface DidYouMeanState {
  /**
   * The correction that was applied to the query. If no correction was applied, will default to an empty string.
   */
  wasCorrectedTo: string;
  /**
   * The query correction that is currently applied by the "did you mean" module.
   */
  queryCorrection: QueryCorrection;
  /**
   * The original query that was originally performed when an automatic correction is executed.
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
