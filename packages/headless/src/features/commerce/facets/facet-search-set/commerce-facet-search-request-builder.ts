import {CommerceFacetSearchRequest} from '../../../../api/commerce/facet-search/facet-search-request';
import {buildCommerceAPIRequest} from '../../common/actions';
import {StateNeededForCommerceFacetSearch} from './commerce-facet-search-state';

export const buildCommerceFacetSearchRequest = async (
  solutionTypeId: string,
  facetId: string,
  state: StateNeededForCommerceFacetSearch,
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
  } = await buildCommerceAPIRequest(solutionTypeId, state);

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
