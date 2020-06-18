import {PlatformClient} from '../platform-client';
import {planRequestParams, PlanRequestParams} from './plan/plan-request';
import {PlanResponse} from './plan/plan-response';
import {SearchPageState} from '../../state';
import {QuerySuggestResponse} from './query-suggest/query-suggest-response';
import {
  querySuggestRequestParams,
  QuerySuggestRequestParams,
} from './query-suggest/query-suggest-request';
import {baseSearchParams} from './search-request';
import {SearchRequest, searchRequestParams} from './search/search-request';
import {SearchResponse} from './search/search-response';

export interface SearchAPIClientOptions<RequestParams> {
  accessToken: string;
  searchApiBaseUrl: string;
  requestParams: RequestParams;
}

export class SearchAPIClient {
  static async plan(state: SearchPageState) {
    return await PlatformClient.call<PlanRequestParams, PlanResponse>({
      ...baseSearchParams(state, 'POST', 'application/json', '/plan'),
      requestParams: planRequestParams(state),
    });
  }

  static async querySuggest(id: string, state: SearchPageState) {
    return await PlatformClient.call<
      QuerySuggestRequestParams,
      QuerySuggestResponse
    >({
      ...baseSearchParams(state, 'POST', 'application/json', '/querySuggest'),
      requestParams: querySuggestRequestParams(id, state),
    });
  }

  static async search(state: SearchPageState) {
    return await PlatformClient.call<SearchRequest, SearchResponse>({
      ...baseSearchParams(state, 'POST', 'application/json', ''),
      requestParams: searchRequestParams(state),
    });
  }
}
