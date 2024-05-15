/**
 * A facet to use for field suggestions.
 */
export interface FieldSuggestionsFacet {
  /**
   * The facet ID.
   */
  facetId: string;

  /**
   * The facet type.
   */
  type: 'regular' | 'hierarchical';
}

export type FieldSuggestionsOrderState = FieldSuggestionsFacet[];

export function getFieldSuggestionsOrderInitialState(): FieldSuggestionsOrderState {
  return [];
}
