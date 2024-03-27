import {CommerceFacetSearchRequest} from '../../../../../api/commerce/facet-search/facet-search-request';
import {buildCommerceAPIRequest} from '../../../common/actions';
import {StateNeededForRegularFacetSearch} from './commerce-regular-facet-search-state';

export const buildFacetSearchRequest = async (
  facetId: string,
  state: StateNeededForRegularFacetSearch,
  isFieldSuggestionsRequest: boolean
): Promise<CommerceFacetSearchRequest> => {
  const baseFacetQuery = state.facetSearchSet[facetId].options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  const query = state.query?.q;

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
    trackingId,
    language,
    country,
    currency,
    clientId,
    context,
    ...(!isFieldSuggestionsRequest && {...restOfCommerceAPIRequest, query}),
  };
};
