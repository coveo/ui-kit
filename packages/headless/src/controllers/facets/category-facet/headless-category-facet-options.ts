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
   * @defaultValue `[]`
   */
  basePath?: string[];

  /**
   * The character that specifies the hierarchical dependency.
   *
   * @defaultValue `;`
   */
  delimitingCharacter?: string;

  /**
   * A unique identifier for the controller. By default, a random unique ID is generated.
   * */
  facetId?: string;

  /**
   * Facet search options.
   */
  facetSearch?: CategoryFacetSearchOptions;

  /**
   * Whether to filter the results using `basePath`.
   *
   * @defaultValue `true`
   */
  filterByBasePath?: boolean;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all of the potential facet values.
   *
   * **Note:** A high `injectionDepth` may reduce facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   * */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet. This option also determines the number of additional values to request each time this facet is expanded, as well as the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `5`
   */
  numberOfValues?: number;

  /**
   * The criterion to use for sorting returned facet values.
   *
   * @defaultValue `occurences`
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
   * @defaultValue `10`
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
