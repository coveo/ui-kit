export interface BaseFacetSearchResult {
  /**
   * The custom facet value display name, as specified in the `captions` argument of the facet request.
   */
  displayValue: string;
  /**
   * The original facet value, as retrieved from the field in the index.
   */
  rawValue: string;
  /**
   * An estimate number of result items matching both the current query and
   * the filter expression that would get generated if the facet value were selected.
   */
  count: number;
}

export interface BaseFacetSearchResponse<T extends BaseFacetSearchResult> {
  /**
   * The facet values.
   */
  values: T[];
  /**
   * Whether additional facet values matching the request are available.
   */
  moreValuesAvailable: boolean;
}
