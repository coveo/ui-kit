import type {
  Correction,
  QueryCorrection,
} from '../../api/search/search/query-corrections.js';

/**
 * Define which query correction system to use
 *
 * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
 * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
 *
 * Default value is `legacy`. In the next major version of Headless, the default value will be `next`.
 */
export type CorrectionMode = 'next' | 'legacy';

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
   * This happens when there is no result returned by the API for a particular misspelling.
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
  /**
   * Whether to automatically correct queries that will return no results.
   *
   */
  automaticallyCorrectQuery: boolean;
  /**
   * Define which query correction system to use
   *
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   *
   * Default value is `legacy`. In the next major version of Headless, the default value will be `next`.
   */
  queryCorrectionMode: CorrectionMode;
}

export const emptyLegacyCorrection: () => QueryCorrection = () => ({
  correctedQuery: '',
  wordCorrections: [],
  originalQuery: '',
});

export const emptyNextCorrection: () => Correction = () => ({
  correctedQuery: '',
  corrections: [],
  originalQuery: '',
});

export function getDidYouMeanInitialState(): DidYouMeanState {
  return {
    enableDidYouMean: false,
    wasCorrectedTo: '',
    wasAutomaticallyCorrected: false,
    queryCorrection: emptyLegacyCorrection(),
    originalQuery: '',
    automaticallyCorrectQuery: true,
    queryCorrectionMode: 'legacy',
  };
}
