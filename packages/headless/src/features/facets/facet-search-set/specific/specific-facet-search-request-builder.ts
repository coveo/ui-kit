import {getSearchApiBaseUrl} from '../../../../api/platform-client.js';
import type {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request.js';
import type {NavigatorContext} from '../../../../app/navigator-context-provider.js';
import {buildSearchRequest} from '../../../search/search-request.js';
import type {StateNeededForSpecificFacetSearch} from '../generic/generic-facet-search-state.js';

export const buildSpecificFacetSearchRequest = async (
  id: string,
  state: StateNeededForSpecificFacetSearch,
  navigatorContext: NavigatorContext,
  isFieldSuggestionsRequest: boolean
): Promise<SpecificFacetSearchRequest> => {
  const {captions, query, numberOfValues} = state.facetSearchSet[id].options;
  const {field, currentValues, filterFacetCount} = state.facetSet[id]!.request;
  const ignoreValues = currentValues
    .filter((v) => v.state !== 'idle')
    .map((facetValue) => facetValue.value);
  const newQuery = `*${query}*`;

  return {
    url:
      state.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    ...(state.configuration.search.authenticationProviders && {
      authentication:
        state.configuration.search.authenticationProviders.join(','),
    }),
    captions,
    numberOfValues,
    query: newQuery,
    field,
    ignoreValues,
    filterFacetCount,
    type: 'specific',
    ...(isFieldSuggestionsRequest
      ? {}
      : {
          searchContext: (await buildSearchRequest(state, navigatorContext))
            .request,
        }),
  };
};
