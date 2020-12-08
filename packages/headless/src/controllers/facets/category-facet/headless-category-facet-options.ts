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

export type CategoryFacetOptions = {
  field: string;
  facetId?: string;
  basePath?: string[];
  delimitingCharacter?: string;
  filterByBasePath?: boolean;
  filterFacetCount?: boolean;
  injectionDepth?: number;
  numberOfValues?: number;
  sortCriteria?: CategoryFacetSortCriterion;
  facetSearch?: CategoryFacetSearchOptions;
};

type CategoryFacetSearchOptions = {
  captions?: Record<string, string>;
  numberOfValues?: number;
  query?: string;
};

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
