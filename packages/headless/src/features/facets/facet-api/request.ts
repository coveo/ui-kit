import type {FacetSortOrder} from '../facet-set/interfaces/request.js';
import type {FacetValueState} from './value.js';

export interface BaseFacetRequest {
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId: string;
  /** The field from which to display values in the facet.*/
  field: string;
  /** Whether to exclude folded result parents when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   *
   * @defaultValue `true`
   */
  filterFacetCount: boolean;
  /** The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high `injectionDepth` may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   */
  injectionDepth: number;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   * Minimum: `1`
   * @defaultValue `8`
   */
  numberOfValues: number;
  /** Whether to prevent Coveo ML from automatically selecting values.
   * @defaultValue `false`
   */
  preventAutoSelect: boolean;

  /**
   * The criterion to use for specifying how results must match the selected facet values.
   *
   * @defaultValue `atLeastOneValue`
   */
  resultsMustMatch: FacetResultsMustMatch;
}

export interface BaseFacetValueRequest {
  /** The current facet value state.
   * @defaultValue `idle`
   */
  state: FacetValueState;
  /**
   * The previous facet value state in the search interface.
   */
  previousState?: FacetValueState;
}

export interface CurrentValues<T> {
  /** The values displayed by the facet in the search interface at the moment of the request.
   * @defaultValue `[]`
   */
  currentValues: T[];
}

export interface Freezable {
  /** Setting this to true is ensures that the facet does not move around while the end-user is interacting with it in the search interface.
   * @defaultValue `false`
   */
  freezeCurrentValues: boolean;
}

export interface Delimitable {
  /** The character that specifies the hierarchical dependency.
   * @defaultValue `>`
   */
  delimitingCharacter: string;
}

export interface Expandable {
  /** Whether the facet is expanded in the search interface at the moment of the request.
   * @defaultValue `false`
   */
  isFieldExpanded: boolean;
}

export interface Type<T extends FacetType> {
  type: T;
}

export type FacetType =
  | 'specific'
  | 'dateRange'
  | 'numericalRange'
  | 'hierarchical';

export interface SortCriteria<
  T extends
    | 'score'
    | 'alphanumeric'
    | 'alphanumericDescending'
    | 'alphanumericNatural'
    | 'alphanumericNaturalDescending'
    | 'ascending'
    | 'descending'
    | 'occurrences'
    | 'automatic'
    | SpecificSortCriteriaExplicitAlphanumeric,
> {
  /** The sort criterion to apply to the returned facet values. */
  sortCriteria: T;
}

export interface SpecificSortCriteriaExplicitAlphanumeric {
  type: 'alphanumeric';
  order: FacetSortOrder;
}

export interface RangeAlgorithm<T extends 'even' | 'equiprobable'> {
  /** The range algorithm to apply to automatically generated ranges for range facet. */
  rangeAlgorithm: T;
}

export type FacetResultsMustMatch = 'allValues' | 'atLeastOneValue';

export const facetResultsMustMatch: FacetResultsMustMatch[] = [
  'allValues',
  'atLeastOneValue',
];

export interface AllowedValues {
  /**
   *  Specifies an explicit list of `allowedValues` in the Search API request.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   */
  allowedValues?: {
    type: 'simple';
    values: string[];
  };
}

export interface CustomSort {
  /**
   * Identifies the facet values that must appear at the top, in this order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  customSort?: string[];
}
