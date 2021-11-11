import {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request';
import {buildSearchRequest} from '../../../search/search-request';
import {StateNeededForSpecificFacetSearch} from '../generic/generic-facet-search-state';

export const buildSpecificFacetSearchRequest = async (
  id: string,
  state: StateNeededForSpecificFacetSearch
): Promise<SpecificFacetSearchRequest> => {
  const {captions, query, numberOfValues} = state.facetSearchSet[id].options;
  const {field, currentValues} = state.facetSet[id];
  const searchContext = (await buildSearchRequest(state)).request;
  const ignoreValues = currentValues
    .filter((v) => v.state !== 'idle')
    .map((facetValue) => facetValue.value);
  const newQuery = `*${query}*`;

  return {
    url: state.configuration.search.apiBaseUrl,
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    captions,
    numberOfValues,
    query: newQuery,
    field,
    ignoreValues,
    searchContext,
    type: 'specific',
  };
};
