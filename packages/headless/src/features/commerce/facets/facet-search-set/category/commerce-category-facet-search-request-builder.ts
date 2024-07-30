import {CategoryFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request';
import {NavigatorContext} from '../../../../../app/navigatorContextProvider';
import {buildCommerceAPIRequest} from '../../../common/actions';
import {
  AnyFacetRequest,
  CategoryFacetRequest,
} from '../../facet-set/interfaces/request';
import {StateNeededForCategoryFacetSearch} from './commerce-category-facet-search-state';

export const buildCategoryFacetSearchRequest = (
  facetId: string,
  state: StateNeededForCategoryFacetSearch,
  isFieldSuggestionsRequest: boolean,
  navigatorContext: NavigatorContext
): CategoryFacetSearchRequest => {
  const baseFacetQuery = state.categoryFacetSearchSet[facetId]!.options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  const categoryFacet = state.commerceFacetSet[facetId]?.request;
  const path =
    categoryFacet && isCategoryFacetRequest(categoryFacet)
      ? categoryFacet && getPathToSelectedCategoryFacetItem(categoryFacet)
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
  } = buildCommerceAPIRequest(state, navigatorContext);

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
    query,
    ...(!isFieldSuggestionsRequest && {...restOfCommerceAPIRequest, query: ''}),
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
