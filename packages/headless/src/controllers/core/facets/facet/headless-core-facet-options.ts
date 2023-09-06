import {Schema, StringValue} from '@coveo/bueno';
import {
  FacetResultsMustMatch,
  facetResultsMustMatch,
} from '../../../../features/facets/facet-api/request';
import {
  facetSortCriteria,
  FacetSortCriterion,
} from '../../../../features/facets/facet-set/interfaces/request';
import {
  facetId,
  field,
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
   * Learn more about `sortCriteria` values and the default behavior of specific facets in the [Search API documentation](https://docs.coveo.com/en/1461/build-a-search-ui/query-parameters#RestFacetRequest-sortCriteria).
   *
   * @defaultValue `automatic`
   */
  sortCriteria?: FacetSortCriterion;

  /**
   * The criterion to use for specifying how results must match the selected facet values.
   *
   * @defaultValue `atLeastOneValue`
   */
  resultsMustMatch?: FacetResultsMustMatch;
}

export interface FacetSearchOptions {
  /**
   * A dictionary that maps index field values to facet value display names.
   */
  captions?: Record<string, string>;

  /**
   * The maximum number of values to fetch.
   *
   * @defaultValue `10`
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
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  resultsMustMatch: new StringValue({constrainTo: facetResultsMustMatch}),
  facetSearch,
});
