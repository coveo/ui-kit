import {
  AnyFacetValueResponse,
  CategoryFacetValue,
  FacetType,
} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils';

export function findIfHasActiveValues(
  values: AnyFacetValueResponse[],
  facetType: FacetType
) {
  return facetType === 'hierarchical'
    ? !!findActiveValueAncestry(values as CategoryFacetValue[]).length
    : values.some((facetValue) => facetValue.state !== 'idle');
}
