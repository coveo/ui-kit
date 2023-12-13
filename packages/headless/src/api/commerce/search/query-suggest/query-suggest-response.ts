import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../../../search/search-api-error-response';

/**
 * A Coveo ML query suggestion.
 */
export interface QuerySuggestCompletion {
  /**
   * The original query expression.
   */
  expression: string;

  /**
   * The highlighted query completion suggestion.
   */
  highlighted: string;
}

/**
 * A response from the Coveo ML query suggest service.
 */
export interface QuerySuggestSuccessResponse {
  /**
   * Contains an array of query suggestions.
   */
  completions: QuerySuggestCompletion[];

  /**
   * The query suggest response ID.
   */
  responseId: string;
}

export type QuerySuggest =
  | QuerySuggestSuccessResponse
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
