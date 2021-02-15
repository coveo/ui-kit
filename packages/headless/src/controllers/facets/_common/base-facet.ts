import {FacetValueState} from '../../../features/facets/facet-api/value';

export interface BaseFacetState {
  /** `true` if a search is in progress and `false` otherwise. */
  isLoading: boolean;

  /** `true` if there is at least one non-idle value and `false` otherwise. */
  hasActiveValues: boolean;

  /** `true` if fewer values can be displayed and `false` otherwise. */
  canShowLessValues: boolean;
}

export interface BaseFacetSearch {
  /** updates text */
  updateText(text: string): void;
  /** shows more results */
  showMoreResults(): void;
  /** performs a search */
  search(): void;
}

export interface BaseFacetSearchState {
  /** whether loading */
  isLoading: boolean;

  /** whether more values are available */
  moreValuesAvailable: boolean;
}

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

export interface BaseFacetValue {
  /** the value */
  value: string;
  /** whether the value is selected or idle */
  state: FacetValueState;
  /** the number of results having the value */
  numberOfResults: number;
}
