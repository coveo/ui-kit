import {SearchAPIClient, SearchAPIClientOptions} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
jest.mock('../platform-client');

describe('search api client', () => {
  it(`when calling SearchAPIClient.plan
  should call PlatformClient.call with the right options`, () => {
    const planOptions: SearchAPIClientOptions<PlanRequestParams> = {
      accessToken: 'mytoken123',
      endpoint: 'myenpoint.com/search',
      requestParams: {
        organizationId: 'myorg',
        q: 'a query',
      },
    };

    SearchAPIClient.plan(planOptions);

    const callOptions: PlatformClientCallOptions<PlanRequestParams> = {
      accessToken: planOptions.accessToken,
      contentType: 'application/json',
      method: 'POST',
      url: `${planOptions.endpoint}/plan`,
      requestParams: {
        q: planOptions.requestParams.q,
        organizationId: planOptions.requestParams.organizationId,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(callOptions);
  });
});
