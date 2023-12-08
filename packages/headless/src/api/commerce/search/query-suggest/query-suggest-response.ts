import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response';

/**
 * A Coveo ML query suggestion.
 */
export interface QuerySuggestCompletion {
  /**
   * Contains the expression to complete.
   */
  expression: string;

  /**
   * Contains the highlighted expression to complete.
   */
  highlighted: string;
}

/**
 * A response from the Coveo ML query suggest service.
 */
export interface QuerySuggestSuccessResponse {
  /**
   * Contains an array of completions.
   */
  completions: QuerySuggestCompletion[];

  /**
   * The query suggest response id.
   */
  responseId: string;
}

export type QuerySuggest =
  | QuerySuggestSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
