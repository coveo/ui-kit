import pino from 'pino';
import {Trigger} from '../../api/search/trigger';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../test';
import {buildMockSearchAPIClient} from '../../test/mock-search-api-client';
import {validatePayloadAndThrow} from '../../utils/validate-payload';
import {checkForRedirection} from './redirection-actions';
import {logRedirection} from './redirection-analytics-actions';
import {redirectionReducer} from './redirection-slice';
import {
  getRedirectionInitialState,
  RedirectionState,
} from './redirection-state';

describe('redirection slice', () => {
  it('should have initial state', () => {
    expect(redirectionReducer(undefined, {type: 'randomAction'})).toEqual(
      getRedirectionInitialState()
    );
  });

  it('should handle checkForRedirection.fulfilled on initial state', () => {
    const expectedState: RedirectionState = {
      ...getRedirectionInitialState(),
      redirectTo: 'https://www.coveo.com',
    };

    const action = checkForRedirection.fulfilled('https://www.coveo.com', '', {
      defaultRedirectionUrl: 'https://platform.cloud.coveo.com/',
    });
    expect(redirectionReducer(undefined, action)).toEqual(expectedState);
  });

  it('should handle checkForRedirection.fulfilled on an existing state', () => {
    const existingState: RedirectionState = {
      ...getRedirectionInitialState(),
      redirectTo: 'https://www.amazon.com',
    };
    const expectedState: RedirectionState = {
      ...getRedirectionInitialState(),
      redirectTo: 'https://www.coveo.com',
    };

    const action = checkForRedirection.fulfilled('https://www.coveo.com', '', {
      defaultRedirectionUrl: 'https://platform.cloud.coveo.com/',
    });
    expect(redirectionReducer(existingState, action)).toEqual(expectedState);
  });

  let engine: MockSearchEngine;
  interface MockPlanConfiguration {
    trigger?: Trigger;
    defaultRedirectionUrl?: string;
  }

  async function mockPlan(config: MockPlanConfiguration = {}) {
    const {defaultRedirectionUrl: url, trigger} = config;
    const defaultRedirectionUrl = url || 'https://www.test.com';
    const triggers = trigger ? [trigger] : [];

    const apiClient = buildMockSearchAPIClient();
    jest.spyOn(apiClient, 'plan').mockResolvedValue({
      success: {
        parsedInput: {basicExpression: '', largeExpression: ''},
        preprocessingOutput: {triggers},
      },
    });

    engine = buildMockSearchAppEngine();

    const response = await checkForRedirection({
      defaultRedirectionUrl,
    })(engine.dispatch, () => createMockState(), {
      apiClient: apiClient,
      searchAPIClient: apiClient,
      analyticsClientMiddleware: (_, p) => p,
      logger: pino({level: 'silent'}),
      validatePayload: validatePayloadAndThrow,
    });

    return response;
  }

  function getlogRedirectionAction() {
    return engine.actions.find((a) => a.type === logRedirection.pending.type);
  }

  it(`when the plan endpoint doesn't return a redirection trigger
  payload should contain the defaultRedirectionUrl`, async () => {
    const response = await mockPlan();
    expect(response.payload).toBe('https://www.test.com');
  });

  it(`when the plan endpoint doesn't return a redirection trigger,
  and the defaultRedirectionUrl is a relative url,
  payload should contain the defaultRedirectionUrl`, async () => {
    const defaultRedirectionUrl = '/search-page';
    const response = await mockPlan({defaultRedirectionUrl});

    expect(response.payload).toBe(defaultRedirectionUrl);
  });

  it(`when the plan endpoint doesn't return a redirection trigger
  should not dispatch a logRedirection action`, async () => {
    await mockPlan();
    expect(getlogRedirectionAction()).toBeFalsy();
  });

  it(`when the plan endpoint returns a redirection trigger
  payload should contain the redirection trigger URL`, async () => {
    const response = await mockPlan({
      trigger: {
        type: 'redirect',
        content: 'https://www.coveo.com',
      },
    });
    expect(response.payload).toBe('https://www.coveo.com');
    expect(getlogRedirectionAction()).toBeTruthy();
  });

  it(`when the plan endpoint returns a redirection trigger
  should dispatch a logRedirection action`, async () => {
    const response = await mockPlan({
      trigger: {
        type: 'redirect',
        content: 'https://www.coveo.com',
      },
    });
    expect(response.payload).toBe('https://www.coveo.com');
    expect(getlogRedirectionAction()).toBeTruthy();
  });
});
