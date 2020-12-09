import {FacetValueState} from './value';

export interface BaseFacetRequest {
  /** A unique id that identifies the facet */
  facetId: string;
  /** The field whose values the facet should display */
  field: string;
  /** Whether to exclude folded result parents when estimating the result count for each facet value
   * @default true
   */
  filterFacetCount: boolean;
  /** The maximum number of items to scan for facet values.
   * @default 1000
   */
  injectionDepth: number;
  /** The maximum number of facet values to fetch
   * @default 8
   */
  numberOfValues: number;
  /** Whether to prevent Coveo ML from automatically selecting values.
   * @default false
   */
  preventAutoSelect: boolean;
}

export interface BaseFacetValueRequest {
  state: FacetValueState;
}

export interface CurrentValues<T> {
  currentValues: T[];
}

export interface Freezable {
  freezeCurrentValues: boolean;
}

export interface Delimitable {
  /** The character seperating the values.
   * @default >
   */
  delimitingCharacter: string;
}

export interface Expandable {
  isFieldExpanded: boolean;
}

export interface Type<
  T extends 'specific' | 'dateRange' | 'numericalRange' | 'hierarchical'
> {
  type: T;
}

export interface SortCriteria<
  T extends
    | 'score'
    | 'alphanumeric'
    | 'ascending'
    | 'descending'
    | 'occurrences'
    | 'automatic'
> {
  sortCriteria: T;
}
