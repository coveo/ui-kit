import {CommerceFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request';
import {NavigatorContext} from '../../../../../app/navigatorContextProvider';
import {buildCommerceAPIRequest} from '../../../common/actions';
import {StateNeededForRegularFacetSearch} from './commerce-regular-facet-search-state';

export const buildFacetSearchRequest = (
  facetId: string,
  state: StateNeededForRegularFacetSearch,
  isFieldSuggestionsRequest: boolean,
  navigatorContext: NavigatorContext
): CommerceFacetSearchRequest => {
  const baseFacetQuery = state.facetSearchSet[facetId]!.options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  let query = state.commerceQuery?.query;

  // eslint-disable-next-line @cspell/spellchecker
  // TODO: CAPI-911 Handle field suggestions without having to pass in the search context.
  if (query === undefined) {
    query = '';
  }

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
    trackingId,
    language,
    country,
    currency,
    clientId,
    context,
    ...(!isFieldSuggestionsRequest && {...restOfCommerceAPIRequest, query}),
  };
};
