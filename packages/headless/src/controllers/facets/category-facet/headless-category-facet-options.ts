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

type OptionalFacetId = Partial<
  Pick<CategoryFacetRegistrationOptions, 'facetId'>
>;

export type CategoryFacetOptions = Omit<
  CategoryFacetRegistrationOptions,
  'facetId'
> &
  OptionalFacetId & {
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
