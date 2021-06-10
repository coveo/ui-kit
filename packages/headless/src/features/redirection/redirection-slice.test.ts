import {redirectionReducer} from './redirection-slice';
import {checkForRedirection} from './redirection-actions';
import {Trigger} from '../../api/search/trigger';
import {logTriggerRedirect} from './redirection-analytics-actions';
import {
  getRedirectionInitialState,
  RedirectionState,
} from './redirection-state';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockEngine,
} from '../../test';
import {SearchAppState} from '../../state/search-app-state';
import pino from 'pino';
import {validatePayloadAndThrow} from '../../utils/validate-payload';
import {buildMockSearchAPIClient} from '../../test/mock-search-api-client';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockTriggerRedirect} from '../../test/mock-trigger-redirect';
import {buildMockTriggerNotify} from '../../test/mock-trigger-notify';
import {buildMockTriggerQuery} from '../../test/mock-trigger-query';
import {executeSearch} from '../search/search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';

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

  let engine: MockEngine<SearchAppState>;
  async function mockPlan(trigger?: Trigger) {
    const apiClient = buildMockSearchAPIClient();
    const triggers = trigger ? [trigger] : [];
    jest.spyOn(apiClient, 'plan').mockResolvedValue({
      success: {
        parsedInput: {basicExpression: '', largeExpression: ''},
        preprocessingOutput: {triggers},
      },
    });

    engine = buildMockSearchAppEngine();

    const response = await checkForRedirection({
      defaultRedirectionUrl: 'https://www.test.com',
    })(engine.dispatch, () => createMockState(), {
      searchAPIClient: apiClient,
      analyticsClientMiddleware: (_, p) => p,
      logger: pino({level: 'silent'}),
      validatePayload: validatePayloadAndThrow,
    });

    return response;
  }

  function getLogTriggerRedirectAction() {
    return engine.actions.find(
      (a) => a.type === logTriggerRedirect.pending.type
    );
  }

  it(`when the plan endpoint doesn't return a redirection trigger
  payload should contain the defaultRedirectionUrl`, async (done) => {
    const response = await mockPlan();
    expect(response.payload).toBe('https://www.test.com');
    done();
  });

  it(`when the plan endpoint doesn't return a redirection trigger
  should not dispatch a logTriggerRedirect action`, async (done) => {
    await mockPlan();
    expect(getLogTriggerRedirectAction()).toBeFalsy();
    done();
  });

  it(`when the plan endpoint returns a redirection trigger
  payload should contain the redirection trigger URL`, async (done) => {
    const response = await mockPlan({
      type: 'redirect',
      content: 'https://www.coveo.com',
    });
    expect(response.payload).toBe('https://www.coveo.com');
    expect(getLogTriggerRedirectAction()).toBeTruthy();
    done();
  });

  it(`when the plan endpoint returns a redirection trigger
  should dispatch a logTriggerRedirect action`, async (done) => {
    const response = await mockPlan({
      type: 'redirect',
      content: 'https://www.coveo.com',
    });
    expect(response.payload).toBe('https://www.coveo.com');
    expect(getLogTriggerRedirectAction()).toBeTruthy();
    done();
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any Trigger objects, it does not update `state.redirectTo`', () => {
    const state = getRedirectionInitialState();
    const response = buildMockSearchResponse();
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = redirectionReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any TriggerRedirect objects, it does not update `state.redirectTo`', () => {
    const state = getRedirectionInitialState();
    const triggers = [
      buildMockTriggerNotify({content: 'notification'}),
      buildMockTriggerQuery({content: 'query'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = redirectionReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload contains TriggerRedirect objects, it updates `state.redirectTo`', () => {
    const state = getRedirectionInitialState();
    const triggers = [
      buildMockTriggerRedirect({content: 'https://www.coveo.com'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = redirectionReducer(state, action);

    expect(finalState.redirectTo).toEqual('https://www.coveo.com');
  });
});
