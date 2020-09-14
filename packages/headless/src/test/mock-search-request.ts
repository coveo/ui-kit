import {SearchRequest} from '../api/search/search/search-request';
import {getFieldsInitialState} from '../features/fields/fields-slice';

export function buildMockSearchRequest(
  config: Partial<SearchRequest> = {}
): SearchRequest {
  return {
    context: {},
    enableDidYouMean: false,
    facets: [],
    firstResult: 0,
    numberOfResults: 10,
    q: '',
    cq: '',
    sortCriteria: 'relevancy',
    fieldsToInclude: getFieldsInitialState().fieldsToInclude,
    pipeline: '',
    searchHub: '',
    ...config,
  };
}
