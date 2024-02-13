import {SearchContextParam} from '../../../../api/commerce/facet-search/facet-search-params';
import {CommerceFacetSearchRequest} from '../../../../api/commerce/facet-search/facet-search-request';
import {buildCommerceAPIRequest} from '../../common/actions';
import {StateNeededForCommerceFacetSearch} from './commerce-facet-search-state';

export const buildCommerceFacetSearchRequest = async (
  facetId: string,
  state: StateNeededForCommerceFacetSearch,
  isFieldSuggestionsRequest: boolean
): Promise<CommerceFacetSearchRequest> => {
  const {query} = state.facetSearchSet[facetId].options;
  const facetQuery = `*${query}*`;
  const {configuration} = state;
  const {accessToken, organizationId} = configuration;
  const {apiBaseUrl, authenticationProviders} = configuration.search;

  let searchContext: SearchContextParam;
  if (!isFieldSuggestionsRequest) {
    const {url, accessToken, organizationId, ...restOfCommerceAPIRequest} =
      buildCommerceAPIRequest(state);
    searchContext = {searchContext: restOfCommerceAPIRequest};
  } else {
    searchContext = {};
  }

  return {
    url: apiBaseUrl,
    accessToken,
    organizationId,
    ...(authenticationProviders && {
      authentication: authenticationProviders.join(','),
    }),
    facetId,
    facetQuery,
    ...searchContext,
  };
};
