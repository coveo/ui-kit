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
   */
  automaticallyCorrectQuery: boolean;
  // TODO: V3: Change the default to true
  /**
   * Whether to use machine learning powered query suggestions model as a fallback to provide query corrections.
   * This system requires a working and properly configured query suggestions model in the Coveo platform.
   *
   * This option is off by default. As such, the Coveo platform will use an older query correction system, powered solely by the index.
   * By opting in this new system, the Coveo Search API will stop returning the `queryCorrections` field in the response.
   * Instead, it will start returning a `changedQuery` field.
   * This implies that the usage of this option introduce a breaking change in the way query corrections are handled, both at the Search API and Headless level.
   *
   * When this option is enabled, the Coveo platform will automatically correct the query, without any further interaction from either the end user, or the Headless library.
   * As such, when this option is enabled, #automaticallyCorrectQuery cannot be set to false.
   */
  enableFallbackSearchOnEmptyQueryResults: boolean;
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
    automaticallyCorrectQuery: true,
    enableFallbackSearchOnEmptyQueryResults: false,
  };
}
