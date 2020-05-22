import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {HeadlessState} from '../../state';
import {QuerySuggestRequestParams} from './query-suggest/query-suggest-request';
import {createMockState} from '../../utils/mock-state';
import {getQuerySuggestInitialState} from '../../features/query-suggest/query-suggest-slice';

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
          searchApiBaseUrl: 'test.com/rest/search',
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
      url: `${state.configuration.search.searchApiBaseUrl}/plan`,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.query.q,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  it(`when calling SearchAPIClient.querySuggest
  should call PlatformClient.call with the right options`, () => {
    const id = 'someid123';
    const state = createMockState();
    state.querySuggest[id] = {
      ...getQuerySuggestInitialState(),
      id,
      q: 'some query',
      count: 11,
    };

    SearchAPIClient.querySuggest(id, state);

    const expectedRequest: PlatformClientCallOptions<QuerySuggestRequestParams> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${state.configuration.search.searchApiBaseUrl}/querySuggest`,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.querySuggest[id]!.q,
        count: state.querySuggest[id]!.count,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
