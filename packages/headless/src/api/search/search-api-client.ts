import {PlatformClient, HttpMethods, HTTContentTypes} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {PlanResponse} from './plan/plan-response';
import {HeadlessState} from '../../state';

export interface SearchAPIClientOptions<RequestParams> {
  accessToken: string;
  endpoint: string;
  requestParams: RequestParams;
}

const accessToken = (state: HeadlessState) => state.configuration.accessToken;
const endpoint = (state: HeadlessState) => state.configuration.search.endpoint;
const q = (state: HeadlessState) => state.query.q;
const organizationId = (state: HeadlessState) =>
  state.configuration.organizationId;

const baseParams = (
  state: HeadlessState,
  method: HttpMethods,
  contentType: HTTContentTypes,
  path: string
) => ({
  accessToken: accessToken(state),
  method,
  contentType,
  url: `${endpoint(state)}${path}`,
});

export class SearchAPIClient {
  static async plan(state: HeadlessState) {
    return await PlatformClient.call<PlanRequestParams, PlanResponse>({
      ...baseParams(state, 'POST', 'application/json', '/plan'),
      requestParams: {
        q: q(state),
        organizationId: organizationId(state),
      },
    });
  }
}
