import {CategoryFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import {NavigatorContext} from '../../../../../app/navigatorContextProvider.js';
import {buildCommerceAPIRequest} from '../../../common/actions.js';
import {
  AnyFacetRequest,
  CategoryFacetRequest,
} from '../../facet-set/interfaces/request.js';
import {getFacetIdWithoutCommerceFieldSuggestionNamespace} from '../commerce-facet-search-actions.js';
import {StateNeededForCategoryFacetSearch} from './commerce-category-facet-search-state.js';

export const buildCategoryFacetSearchRequest = (
  facetId: string,
  state: StateNeededForCategoryFacetSearch,
  isFieldSuggestionsRequest: boolean,
  navigatorContext: NavigatorContext
): CategoryFacetSearchRequest => {
  const baseFacetQuery = state.categoryFacetSearchSet[facetId]!.options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  const categoryFacet =
    state.commerceFacetSet[
      getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId)
    ]?.request;
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
    facetId: getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId),
    facetQuery,
    ignorePaths,
    trackingId,
    language,
    country,
    currency,
    clientId,
    context,
    query,
    ...(!isFieldSuggestionsRequest && {...restOfCommerceAPIRequest}),
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
