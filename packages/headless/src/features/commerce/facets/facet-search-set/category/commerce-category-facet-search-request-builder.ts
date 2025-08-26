import type {CategoryFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import {buildFilterableCommerceAPIRequest} from '../../../common/filterable-commerce-api-request-builder.js';
import type {
  AnyFacetRequest,
  CategoryFacetRequest,
} from '../../facet-set/interfaces/request.js';
import {getFacetIdWithoutCommerceFieldSuggestionNamespace} from '../commerce-facet-search-actions.js';
import type {StateNeededForCategoryFacetSearch} from './commerce-category-facet-search-state.js';

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
  const query = isFieldSuggestionsRequest
    ? baseFacetQuery
    : state.commerceQuery?.query;
  const numberOfValues =
    state.categoryFacetSearchSet[facetId]!.options.numberOfValues;

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
  } = buildFilterableCommerceAPIRequest(state, navigatorContext);

  return {
    url,
    accessToken,
    organizationId,
    facetId: getFacetIdWithoutCommerceFieldSuggestionNamespace(facetId),
    facetQuery: isFieldSuggestionsRequest ? '*' : facetQuery,
    numberOfValues,
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
