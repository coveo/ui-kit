/**
 * The IQuerySuggestCompletion interface describes a completion suggestion from the Coveo Machine Learning
 * service (see [Coveo Machine Learning](https://docs.coveo.com/en/1727/).
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
 * The IQuerySuggestResponse interface describes a response from the Coveo Machine Learning service query
 * suggestions.
 */
export interface QuerySuggestResponse {
  /**
   * Contains an array of completions.
   */
  completions: QuerySuggestCompletion[];
}
