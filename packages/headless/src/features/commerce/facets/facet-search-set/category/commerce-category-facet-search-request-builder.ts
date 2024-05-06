import {CategoryFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request';
import {buildCommerceAPIRequest} from '../../../common/actions';
import {
  AnyFacetRequest,
  CategoryFacetRequest,
} from '../../facet-set/interfaces/request';
import {StateNeededForCategoryFacetSearch} from './commerce-category-facet-search-state';

export const buildCategoryFacetSearchRequest = async (
  facetId: string,
  state: StateNeededForCategoryFacetSearch,
  isFieldSuggestionsRequest: boolean
): Promise<CategoryFacetSearchRequest> => {
  const baseFacetQuery = state.categoryFacetSearchSet[facetId]!.options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  const categoryFacet = state.commerceFacetSet[facetId]!.request;
  const path = isCategoryFacetRequest(categoryFacet)
    ? getPathToSelectedCategoryFacetItem(categoryFacet)
    : [];
  const ignorePaths = path.length ? [path] : [];
  const query = state.commerceQuery?.query;

  const {
    url,
    accessToken,
    organizationId,
    trackingId,
    language,
    country,
    currency,
    clientId,
    context,
    ...restOfCommerceAPIRequest
  } = await buildCommerceAPIRequest(state);

  return {
    url,
    accessToken,
    organizationId,
    facetId,
    facetQuery,
    ignorePaths,
    trackingId,
    language,
    country,
    currency,
    clientId,
    context,
    ...(!isFieldSuggestionsRequest && {...restOfCommerceAPIRequest, query}),
  };
};

function isCategoryFacetRequest(
  request: AnyFacetRequest
): request is CategoryFacetRequest {
  return request.type === 'hierarchical';
}

const getPathToSelectedCategoryFacetItem = (
  categoryFacet: CategoryFacetRequest
): string[] => {
  const path = [];
  let selectedValue = categoryFacet.values[0];
  while (selectedValue) {
    path.push(selectedValue.value);
    selectedValue = selectedValue.children[0];
  }
  return path;
};
