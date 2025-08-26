import type {CommerceFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import {buildFilterableCommerceAPIRequest} from '../../../common/filterable-commerce-api-request-builder.js';
import {getFacetIdWithoutCommerceFieldSuggestionNamespace} from '../commerce-facet-search-actions.js';
import type {StateNeededForRegularFacetSearch} from './commerce-regular-facet-search-state.js';

export const buildFacetSearchRequest = (
  facetId: string,
  state: StateNeededForRegularFacetSearch,
  isFieldSuggestionsRequest: boolean,
  navigatorContext: NavigatorContext
): CommerceFacetSearchRequest => {
  const baseFacetQuery = state.facetSearchSet[facetId]!.options.query;
  const numberOfValues = state.facetSearchSet[facetId]!.options.numberOfValues;
  const facetQuery = `*${baseFacetQuery}*`;
  const query = !isFieldSuggestionsRequest
    ? state.commerceQuery?.query
    : baseFacetQuery;

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
