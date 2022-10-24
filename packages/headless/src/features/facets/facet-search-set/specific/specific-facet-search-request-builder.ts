import {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request';
import {buildSearchRequest} from '../../../search/search-request';
import {StateNeededForSpecificFacetSearch} from '../generic/generic-facet-search-state';

export const buildSpecificFacetSearchRequest = async (
  id: string,
  state: StateNeededForSpecificFacetSearch,
  isFieldSuggestionsRequest: boolean
): Promise<SpecificFacetSearchRequest> => {
  const {captions, query, numberOfValues} = state.facetSearchSet[id].options;
  const {field, currentValues, filterFacetCount} = state.facetSet[id];
  const ignoreValues = currentValues
    .filter((v) => v.state !== 'idle')
    .map((facetValue) => facetValue.value);
  const newQuery = `*${query}*`;

  return {
    url: state.configuration.search.apiBaseUrl,
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
      : {searchContext: (await buildSearchRequest(state)).request}),
  };
};
