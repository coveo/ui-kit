import {CommerceFacetSearchRequest} from '../../../../api/commerce/facet-search/facet-search-request';
import {buildCommerceAPIRequest} from '../../common/actions';
import {StateNeededForCommerceFacetSearch} from './commerce-facet-search-state';

export const buildCommerceFacetSearchRequest = async (
  facetId: string,
  state: StateNeededForCommerceFacetSearch,
  isFieldSuggestionsRequest: boolean
): Promise<CommerceFacetSearchRequest> => {
  const baseFacetQuery = state.facetSearchSet[facetId].options.query;
  const facetQuery = `*${baseFacetQuery}*`;
  const query = state.query?.q;

  let searchContext;
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
  } = buildCommerceAPIRequest(state);
  if (!isFieldSuggestionsRequest) {
    searchContext = {...restOfCommerceAPIRequest, query};
  } else {
    searchContext = {};
  }

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
    ...searchContext,
  };
};
