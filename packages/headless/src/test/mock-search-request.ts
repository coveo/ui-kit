import {FoldingParam} from '../api/platform-service-params';
import {SearchRequest} from '../api/search/search/search-request';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {buildMockFacetOptions} from './mock-facet-options';

export function buildMockSearchRequest(
  config: Partial<SearchRequest> = {}
): Required<Omit<SearchRequest, keyof FoldingParam>> & FoldingParam {
  return {
    context: {},
    enableDidYouMean: false,
    enableQuerySyntax: false,
    facets: [],
    facetOptions: buildMockFacetOptions(),
    firstResult: 0,
    numberOfResults: 10,
    locale: 'en-US',
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
    visitorId: '',
    debug: false,
    ...config,
  };
}
