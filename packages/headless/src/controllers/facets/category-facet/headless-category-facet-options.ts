import {Schema, StringValue} from '@coveo/bueno';
import {
  categoryFacetSortCriteria,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request';
import {
  BaseFacetOptions,
  BaseFacetSearchOptions,
} from '../_common/base-facet-options';
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

export interface CategoryFacetOptions extends BaseFacetOptions {
  /**
   * Facet search options.
   */
  facetSearch?: CategoryFacetSearchOptions;
  /**
   * The base path shared by all values for the facet.
   * @default []
   */
  basePath?: string[];
  /**
   * Whether to use basePath as a filter for the results.
   * @default true
   */
  filterByBasePath?: boolean;
  /**
   * The sort criterion to apply to the returned facet values.
   *
   * @default "automatic"
   */
  sortCriteria?: CategoryFacetSortCriterion;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CategoryFacetSearchOptions extends BaseFacetSearchOptions {}

export const categoryFacetOptionsSchema = new Schema<
  Required<CategoryFacetOptions>
>({
  facetId,
  field,
  basePath,
  delimitingCharacter,
  filterByBasePath,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue<CategoryFacetSortCriterion>({
    constrainTo: categoryFacetSortCriteria,
  }),
  facetSearch,
});
