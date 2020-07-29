import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequestParams} from './plan/plan-request';
import {QuerySuggestRequestParams} from './query-suggest/query-suggest-request';
import {createMockState} from '../../test/mock-state';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';

jest.mock('../platform-client');
describe('search api client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when calling SearchAPIClient.plan
  should call PlatformClient.call with the right options`, () => {
    const state = createMockState();

    SearchAPIClient.plan(state);

    const expectedRequest: PlatformClientCallOptions<PlanRequestParams> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${state.configuration.search.searchApiBaseUrl}/plan`,
      requestParams: {
        organizationId: state.configuration.organizationId,
        q: state.query.q,
        context: state.context.contextValues,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  it(`when calling SearchAPIClient.querySuggest
  should call PlatformClient.call with the right options`, () => {
    const id = 'someid123';
    const qs = buildMockQuerySuggest({id, q: 'some query', count: 11});
    const state = createMockState();
    state.querySuggest[id] = qs;

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
        context: state.context.contextValues,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
