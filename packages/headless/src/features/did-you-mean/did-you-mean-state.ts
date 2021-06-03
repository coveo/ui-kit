import {QueryCorrection} from '../../api/search/search/query-corrections';

export interface DidYouMeanState {
  /**
   * Specifies if the "did you mean" feature of the Coveo platform should be enabled or not.
   */
  enableDidYouMean: boolean;
  /**
   * The correction that was applied to the query. If no correction was applied, will default to an empty string.
   */
  wasCorrectedTo: string;
  /**
   * Specifies if the query was automatically corrected by Headless.
   *
   * This happens when there is no result returned by the API for a particular mispelling.
   */
  wasAutomaticallyCorrected: boolean;
  /**
   * The query correction that is currently applied by the "did you mean" module.
   */
  queryCorrection: QueryCorrection;
  /**
   * The original query that was originally performed when an automatic correction is executed.
   */
  originalQuery: string;
}

export const emptyCorrection = () => ({
  correctedQuery: '',
  wordCorrections: [],
  originalQuery: '',
});

export function getDidYouMeanInitialState(): DidYouMeanState {
  return {
    enableDidYouMean: false,
    wasCorrectedTo: '',
    wasAutomaticallyCorrected: false,
    queryCorrection: emptyCorrection(),
    originalQuery: '',
  };
}
