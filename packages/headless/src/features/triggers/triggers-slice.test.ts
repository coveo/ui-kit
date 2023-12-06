import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockExecuteTrigger} from '../../test/mock-trigger-execute';
import {buildMockNotifyTrigger} from '../../test/mock-trigger-notify';
import {buildMockQueryTrigger} from '../../test/mock-trigger-query';
import {buildMockRedirectTrigger} from '../../test/mock-trigger-redirect';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {executeSearch} from '../search/search-actions';
import {triggerReducer} from './triggers-slice';
import {getTriggerInitialState} from './triggers-state';

describe('trigger slice', () => {
  it('should have initial state', () => {
    expect(triggerReducer(undefined, {type: 'randomAction'})).toEqual(
      getTriggerInitialState()
    );
  });

  it('when an executeSearch fulfilled is received and the payload does not contain any Trigger objects, it does not update #state', () => {
    const state = getTriggerInitialState();
    const response = buildMockSearchResponse();
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
    expect(finalState.query).toEqual('');
  });

  it('when an executeSearch fulfilled is received and the payload does not contain any TriggerRedirect objects, it does not update #state.redirectTo', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockNotifyTrigger({content: 'notification'}),
      buildMockQueryTrigger({content: 'query'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
  });

  it('when an executeSearch fulfilled is received and the payload contains TriggerRedirect objects, it updates #state.redirectTo', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockRedirectTrigger({content: 'https://www.coveo.com'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('https://www.coveo.com');
  });

  it('when an executeSearch fulfilled is received and the payload does not contain any TriggerQuery objects, it does not update #state.query', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockNotifyTrigger({content: 'notification'}),
      buildMockRedirectTrigger({content: 'redirect'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.query).toEqual('');
  });

  it('when an executeSearch fulfilled is received and the payload does not contain any TriggerExecute objects, it does not update #state.executions', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockNotifyTrigger({content: 'notification'}),
      buildMockRedirectTrigger({content: 'redirect'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.executions).toEqual([]);
  });

  it('when an executeSearch fulfilled is received and the payload contains TriggerExecute objects, it updates #state.executions', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockExecuteTrigger({
        content: {name: 'function', params: ['a1']},
      }),
    ];

    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.executions).toEqual([
      {
        functionName: 'function',
        params: ['a1'],
      },
    ]);
  });

  it('when an executeSearch fulfilled is received and the payload does not contain any TriggerNotification objects, it does not update #state.notifications', () => {
    const state = getTriggerInitialState();
    const triggers = [
      buildMockQueryTrigger({content: 'query'}),
      buildMockRedirectTrigger({content: 'redirect'}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.notifications).toEqual([]);
  });

  it('when an executeSearch fulfilled is received and the payload contains TriggerNotification objects, it updates #state.notifications', () => {
    const state = getTriggerInitialState();
    const triggers = [buildMockNotifyTrigger({content: 'Hello world'})];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.notifications).toEqual(['Hello world']);
  });

  it('when an executeSearch fulfilled is received and the payload contains two of each Trigger objects, it updates all states members', () => {
    const expectedRedirections = [
      'https://google.com/search?q=coveo%20query%20triggers',
      'https://docs.coveo.com/en/search/#q=coveo%20query%20triggers',
    ];
    const expectedExecutions = [
      {functionName: 'info', params: ['String param', 1, false]},
      {functionName: 'error', params: [2, true, 'No']},
    ];
    const expectedNotifications = ['Hello', 'World'];

    const state = getTriggerInitialState();
    const triggers = [
      buildMockRedirectTrigger({content: expectedRedirections[0]}),
      buildMockRedirectTrigger({content: expectedRedirections[1]}),
      buildMockExecuteTrigger({
        content: {
          name: expectedExecutions[0].functionName,
          params: expectedExecutions[0].params,
        },
      }),
      buildMockExecuteTrigger({
        content: {
          name: expectedExecutions[1].functionName,
          params: expectedExecutions[1].params,
        },
      }),
      buildMockNotifyTrigger({content: expectedNotifications[0]}),
      buildMockNotifyTrigger({content: expectedNotifications[1]}),
    ];
    const response = buildMockSearchResponse({
      triggers,
    });
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual(expectedRedirections[0]);

    expect(finalState.executions).toEqual(expectedExecutions);

    expect(finalState.notifications).toEqual(expectedNotifications);
  });
});
