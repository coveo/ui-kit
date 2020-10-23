import {SearchRequest} from '../api/search/search/search-request';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {buildMockFacetOptions} from './mock-facet-options';

export function buildMockSearchRequest(
  config: Partial<SearchRequest> = {}
): SearchRequest {
  return {
    context: {},
    enableDidYouMean: false,
    facets: [],
    facetOptions: buildMockFacetOptions(),
    firstResult: 0,
    numberOfResults: 10,
    q: '',
    cq: '',
    aq: '',
    sortCriteria: 'relevancy',
    fieldsToInclude: getFieldsInitialState().fieldsToInclude,
    pipeline: 'default',
    searchHub: 'default',
    url: 'https://platform.cloud.coveo.com/rest/search/v2',
    organizationId: '',
    accessToken: '',
    ...config,
  };
}
