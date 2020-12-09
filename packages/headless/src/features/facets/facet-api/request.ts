import {FacetValueState} from './value';

export interface BaseFacetRequest {
  /** The unique identifier of the facet (e.g., `"1"`).*/
  facetId: string;
  /** The name of the field on which to base the facet.*/
  field: string;
  /** Whether to exclude folded result parents when estimating the result count for each facet value
   * @default true
   */
  filterFacetCount: boolean;
  /** The maximum number of items to scan for facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * @default 1000
   */
  injectionDepth: number;
  /** The maximum number of facet values to fetch.
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
  /** The values displayed by the facet in the search interface at the moment of the request.
   * @default []
   */
  currentValues: T[];
}

export interface Freezable {
  /** Setting this to true is useful to ensure that the facet does not move around while the end-user is interacting with it in the search interface.
   * @default false
   */
  freezeCurrentValues: boolean;
}

export interface Delimitable {
  /** The character seperating the values.
   * @default ">"
   */
  delimitingCharacter: string;
}

export interface Expandable {
  /** Whether the facet is expanded in the search interface at the moment of the request.
   * @default false
   */
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
  /** The sort criterion to apply to the returned facet values. */
  sortCriteria: T;
}
