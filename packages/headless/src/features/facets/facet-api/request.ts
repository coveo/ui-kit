import {FacetValueState} from './value';

export interface BaseFacetRequest {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId: string;
  /** The field whose values you want to display in the facet.*/
  field: string;
  /** Whether to exclude folded result parents when estimating the result count for each facet value.
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
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   * @minimum 1
   * @default 8
   */
  numberOfValues: number;
  /** Whether to prevent Coveo ML from automatically selecting values.
   * @default false
   */
  preventAutoSelect: boolean;
}

export interface BaseFacetValueRequest {
  /** The current facet value state.
   * @default "idle"
   */
  state: FacetValueState;
}

export interface CurrentValues<T> {
  /** The values displayed by the facet in the search interface at the moment of the request.
   * @default []
   */
  currentValues: T[];
}

export interface Freezable {
  /** Setting this to true is ensures that the facet does not move around while the end-user is interacting with it in the search interface.
   * @default false
   */
  freezeCurrentValues: boolean;
}

export interface Delimitable {
  /** The character that specifies the hierarchical dependency.
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
