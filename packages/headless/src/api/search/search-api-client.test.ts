import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {HeadlessState} from '../../state';
import {QuerySuggestRequestParams} from './query-suggest/query-suggest-request';

jest.mock('../platform-client');
describe('search api client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it(`when calling SearchAPIClient.querySuggest
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
      querySuggest: {
        count: 10,
      },
    } as HeadlessState;

    SearchAPIClient.querySuggest(state);

    const expectedRequest: PlatformClientCallOptions<QuerySuggestRequestParams> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${state.configuration.search.endpoint}/querySuggest`,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.query.q,
        count: state.querySuggest.count,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
