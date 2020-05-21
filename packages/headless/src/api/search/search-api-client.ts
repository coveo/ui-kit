import {PlatformClient} from '../platform-client';
import {planRequestParams, PlanRequestParams} from './plan/plan-request';
import {PlanResponse} from './plan/plan-response';
import {HeadlessState} from '../../state';
import {QuerySuggestResponse} from './query-suggest/query-suggest-response';
import {
  querySuggestRequestParams,
  QuerySuggestRequestParams,
} from './query-suggest/query-suggest-request';
import {baseSearchParams} from './search-request';

export interface SearchAPIClientOptions<RequestParams> {
  accessToken: string;
  endpoint: string;
  requestParams: RequestParams;
}

export class SearchAPIClient {
  static async plan(state: HeadlessState) {
    return await PlatformClient.call<PlanRequestParams, PlanResponse>({
      ...baseSearchParams(state, 'POST', 'application/json', '/plan'),
      requestParams: planRequestParams(state),
    });
  }

  static async querySuggest(id: string, state: HeadlessState) {
    return await PlatformClient.call<
      QuerySuggestRequestParams,
      QuerySuggestResponse
    >({
      ...baseSearchParams(state, 'POST', 'application/json', '/querySuggest'),
      requestParams: querySuggestRequestParams(id, state),
    });
  }
}
