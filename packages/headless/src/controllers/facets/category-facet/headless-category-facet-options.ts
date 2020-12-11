import {Schema, StringValue} from '@coveo/bueno';
import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
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

type OptionalFacetId = Partial<
  Pick<CategoryFacetRegistrationOptions, 'facetId'>
>;

export type CategoryFacetOptions = OptionalFacetId &
  Omit<CategoryFacetRegistrationOptions, 'facetId'> & {
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
