import {Schema, StringValue} from '@coveo/bueno';
import {
  facetSortCriteria,
  FacetSortCriterion,
} from '../../../features/facets/facet-set/interfaces/request';
import {
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
} from '../_common/facet-option-definitions';

export interface FacetOptions {
  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;

  /**
   * The character that separates values of a multi-value field.
   *
   * @default ">"
   */
  delimitingCharacter?: string;

  /**
   * A unique identifier for the controller. By default, a random unique identifier is generated.
   * */
  facetId?: string;

  /**
   * Facet search options.
   */
  facetSearch?: FacetSearchOptions;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * @default true
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

  /**
   * The criterion to use for sorting returned facet values.
   *
   * @default "automatic"
   */
  sortCriteria?: FacetSortCriterion;
}

export interface FacetSearchOptions {
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
   * The query to search the facet values with.
   */
  query?: string;
}

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  facetSearch,
});
