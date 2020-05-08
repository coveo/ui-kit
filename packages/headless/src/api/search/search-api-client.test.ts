import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {HeadlessState} from '../../state';

jest.mock('../platform-client');
describe('search api client', () => {
  it(`when calling SearchAPIClient.plan
  should call PlatformClient.call with the right options`, () => {
    const state = {
      configuration: {
        accessToken: 'mytoken123',
        organizationId: 'myorg',
        search: {
          endpoint: 'myendpoint.com/rest/search',
        },
      },
      query: {
        q: 'query',
      },
    } as HeadlessState;

    SearchAPIClient.plan(state);

    const expectedRequest: PlatformClientCallOptions<PlanRequestParams> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${state.configuration.search.endpoint}/plan`,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.query.q,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
