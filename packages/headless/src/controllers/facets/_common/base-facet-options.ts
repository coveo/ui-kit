export interface BaseFacetOptions {
  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;
  /**
   * The character that specifies the hierarchical dependency.
   * @default ">"
   */
  delimitingCharacter?: string;
  /**
   * A unique identifier for the controller. By default, a unique random identifier is generated.
   * */
  facetId?: string;
  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
   * @defaut true
   */
  filterFacetCount?: boolean;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * @default 1000
   * @minimum 0
   * */
  injectionDepth?: number;
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * @default 8
   * @minimum 1
   */
  numberOfValues?: number;
}

export interface BaseFacetSearchOptions {
  /**
   * A dictionary that maps index field values to facet value display names.
   */
  captions?: Record<string, string>;
  /**
   * The maximum number of values to fetch.
   *
   * @default 10
   */
  numberOfValues?: number;
  /**
   * The string to match.
   */
  query?: string;
}
