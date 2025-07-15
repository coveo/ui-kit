/**
 * A Coveo ML query suggestion.
 */
interface QuerySuggestCompletion {
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
 * A facet to use for field suggestions.
 */
export interface FieldSuggestionsFacet {
  /**
   * The facet ID.
   */
  facetId: string;

  /**
   * The facet display name.
   */
  displayName: string;

  /**
   * The facet field.
   */
  field: string;

  /**
   * The facet type.
   */
  type: 'regular' | 'hierarchical';
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

  /**
   * The list of facets to use for field suggestions.
   */
  fieldSuggestionsFacets: FieldSuggestionsFacet[];
}
