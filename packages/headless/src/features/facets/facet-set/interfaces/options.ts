import {FacetRequest, FacetSortCriterion} from './request';

export type FacetOptionalParameters = Pick<
  FacetRequest,
  | 'delimitingCharacter'
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
>;

export interface FacetRegistrationOptions {
  /**
   * A unique identifier for the facet.
   * */
  facetId: string;

  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;

  /**
   * The character that separates values of a multi-value field.
   *
   * @defaultValue `>`
   */
  delimitingCharacter?: string;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   * */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `8`
   */
  numberOfValues?: number;

  /**
   * The criterion to use for sorting returned facet values.
   *
   * @defaultValue `automatic`
   */
  sortCriteria?: FacetSortCriterion;
}
