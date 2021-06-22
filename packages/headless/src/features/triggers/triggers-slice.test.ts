import {triggerReducer} from './triggers-slice';
import {getTriggerInitialState} from './triggers-state';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockTriggerRedirect} from '../../test/mock-trigger-redirect';
import {buildMockTriggerNotify} from '../../test/mock-trigger-notify';
import {buildMockTriggerQuery} from '../../test/mock-trigger-query';
import {executeSearch} from '../search/search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';

describe('trigger slice', () => {
  it('should have initial state', () => {
    expect(triggerReducer(undefined, {type: 'randomAction'})).toEqual(
      getTriggerInitialState()
    );
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any Trigger objects, it does not update `state.redirectTo`', () => {
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
  });

  it('when a executeSearch fulfilled is received and the payload does not contain any TriggerRedirect objects, it does not update `state.redirectTo`', () => {
    const state = getTriggerInitialState();
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
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('');
  });

  it('when a executeSearch fulfilled is received and the payload contains TriggerRedirect objects, it updates `state.redirectTo`', () => {
    const state = getTriggerInitialState();
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
    const finalState = triggerReducer(state, action);

    expect(finalState.redirectTo).toEqual('https://www.coveo.com');
  });
});
