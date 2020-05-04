import {PlatformClient} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {PlanResponse} from './plan/plan-response';

export interface SearchAPIClientOptions<RequestParams> {
  accessToken: string;
  endpoint: string;
  requestParams: RequestParams;
}

export class SearchAPIClient {
  static async plan(options: SearchAPIClientOptions<PlanRequestParams>) {
    return await PlatformClient.call<PlanRequestParams, PlanResponse>({
      accessToken: options.accessToken,
      contentType: 'application/json',
      method: 'POST',
      url: `${options.endpoint}/plan`,
      requestParams: {
        q: options.requestParams.q,
        organizationId: options.requestParams.organizationId,
      },
    });
  }
}
