import {Schema, StringValue} from '@coveo/bueno';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
import {
  categoryFacetSortCriteria,
  CategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/interfaces/request';
import {FacetSearchRequestOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
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

export type CategoryFacetOptions = Omit<
  CategoryFacetRegistrationOptions,
  'facetId'
> & {
  facetId?: string;
  facetSearch?: Partial<FacetSearchRequestOptions>;
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
