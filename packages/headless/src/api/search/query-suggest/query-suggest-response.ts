import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';

/**
 * A Coveo ML query suggestion.
 */
export interface QuerySuggestCompletion {
  /**
   * Contains the expression to complete.
   */
  expression: string;

  /**
   * Contains a value indicating how certain the Coveo Machine Learning service is that this suggestion is actually
   * relevant.
   */
  score: number;

  /**
   * Contains the highlighted expression to complete.
   */
  highlighted: string;

  /**
   * Contains a value indicating the confidence level that this suggestion should be executed.
   */
  executableConfidence: number;
}

/**
 * A response from the Coveo ML query suggest service.
 */
export interface QuerySuggestSuccessResponse {
  /**
   * Contains an array of completions.
   */
  completions: QuerySuggestCompletion[];
}

export type QuerySuggest =
  | QuerySuggestSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
