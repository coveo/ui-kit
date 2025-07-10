import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {
  type CategoryFacetSortCriterion,
  categoryFacetSortCriteria,
} from '../../../../features/facets/category-facet-set/interfaces/request.js';
import {
  basePath,
  delimitingCharacter,
  facetId,
  facetSearch,
  field,
  filterByBasePath,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../_common/facet-option-definitions.js';

export interface CategoryFacetOptions {
  /**
   * The field from which to display values in the facet.
   * */
  field: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

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
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all of the potential facet values.
   *
   * Note: A high `injectionDepth` may reduce facet request performance.
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
   * @defaultValue `occurrences`
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
  tabs: new RecordValue({
    options: {
      required: false,
    },
    values: {
      included: new ArrayValue({each: new StringValue()}),
      excluded: new ArrayValue({each: new StringValue()}),
    },
  }),
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
