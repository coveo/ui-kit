import {triggerReducer} from './triggers-slice';
import {getTriggerInitialState} from './triggers-state';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockRedirectTrigger} from '../../test/mock-trigger-redirect';
import {buildMockNotifyTrigger} from '../../test/mock-trigger-notify';
import {buildMockQueryTrigger} from '../../test/mock-trigger-query';
import {executeSearch} from '../search/search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {clearQueryTrigger, clearNotifyTrigger} from './trigger-actions';

describe('trigger slice', () => {
  it('should have initial state', () => {
    expect(triggerReducer(undefined, {type: 'randomAction'})).toEqual(
      getTriggerInitialState()
    );
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any Trigger objects, it does not update #state', () => {
    const state = getTriggerInitialState();
    const response = buildMockSearchResponse();
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
    expect(finalState.query).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any TriggerRedirect objects, it does not update #state.redirectTo', () => {
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

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload contains TriggerRedirect objects, it updates #state.redirectTo', () => {
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

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('https://www.coveo.com');
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any TriggerQuery objects, it does not update #state.query', () => {
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

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = triggerReducer(state, action);

    expect(finalState.query).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload contains TriggerQuery objects, it updates #state.query', () => {
    const state = getTriggerInitialState();
    const triggers = [buildMockQueryTrigger({content: 'Euro'})];
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
    const finalState = triggerReducer(state, action);

    expect(finalState.query).toEqual('Euro');
  });

  it('when clearQueryTrigger is dispatched, it updates #state.query to the empty string', () => {
    const state = getTriggerInitialState();
    const action = clearQueryTrigger;
    state.query = 'Euro 2021';
    const finalState = triggerReducer(state, action);

    expect(finalState.query).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any TriggerNotification objects, it does not update #state.notification', () => {
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

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logSearchboxSubmit()
    );
    const finalState = triggerReducer(state, action);

    expect(finalState.notify).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload contains TriggerQuery objects, it updates #state.notify', () => {
    const state = getTriggerInitialState();
    const triggers = [buildMockNotifyTrigger({content: 'Hello world'})];
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
    const finalState = triggerReducer(state, action);

    expect(finalState.notify).toEqual('Hello world');
  });

  it('when clearNotifyTrigger is dispatched, it updates #state.notify to the empty string', () => {
    const state = getTriggerInitialState();
    const action = clearNotifyTrigger;
    state.notify = 'Hi';
    const finalState = triggerReducer(state, action);

    expect(finalState.notify).toEqual('');
  });
});
