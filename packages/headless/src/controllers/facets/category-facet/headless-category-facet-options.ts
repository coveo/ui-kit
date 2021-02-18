import {Schema, StringValue} from '@coveo/bueno';
import {
  categoryFacetSortCriteria,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request';
import {
  facetId,
  field,
  basePath,
  delimitingCharacter,
  filterByBasePath,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
} from '../_common/facet-option-definitions';

export interface CategoryFacetOptions {
  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;

  /**
   * The base path shared by all values for the facet.
   *
   * @default []
   */
  basePath?: string[];

  /**
   * The character that specifies the hierarchical dependency.
   *
   * @default ";"
   */
  delimitingCharacter?: string;

  /**
   * A unique identifier for the controller. By default, a unique random identifier is generated.
   * */
  facetId?: string;

  /**
   * Facet search options.
   */
  facetSearch?: CategoryFacetSearchOptions;

  /**
   * Whether to use basePath as a filter for the results.
   *
   * @default true
   */
  filterByBasePath?: boolean;

  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
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
   * @default 5
   * @minimum 1
   */
  numberOfValues?: number;

  /**
   * The sort criterion to apply to the returned facet values.
   *
   * @default "occurences"
   */
  sortCriteria?: CategoryFacetSortCriterion;
}

export interface CategoryFacetSearchOptions {
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

export const categoryFacetOptionsSchema = new Schema<
  Required<CategoryFacetOptions>
>({
  field,
  basePath,
  delimitingCharacter,
  facetId,
  facetSearch,
  filterByBasePath,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue<CategoryFacetSortCriterion>({
    constrainTo: categoryFacetSortCriteria,
  }),
});
