import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockExecuteTrigger} from '../../../test/mock-trigger-execute';
import {buildMockNotifyTrigger} from '../../../test/mock-trigger-notify';
import {buildMockQueryTrigger} from '../../../test/mock-trigger-query';
import {buildMockRedirectTrigger} from '../../../test/mock-trigger-redirect';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from '../../triggers/triggers-slice-functions';
import {
  TriggerState,
  getTriggerInitialState,
} from '../../triggers/triggers-state';
import {executeSearch} from '../search/search-actions';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions';
import {commerceTriggersReducer} from './triggers-slice';

describe('commerce triggers slice', () => {
  let initialState: TriggerState;
  let initialStateCopy: TriggerState;
  let expectedState: TriggerState;
  let finalState: TriggerState;

  beforeEach(() => {
    jest.resetAllMocks();
    initialState = getTriggerInitialState();
    initialStateCopy = JSON.parse(
      JSON.stringify(initialState)
    ) as typeof initialState;
  });
  it('should have initial state', () => {
    expect(commerceTriggersReducer(undefined, {type: 'randomAction'})).toEqual(
      initialState
    );
  });

  it('on #executeSearch.pending, updates state using #handleFetchItemsPending', () => {
    expectedState = handleFetchItemsPending(initialStateCopy);
    const action = executeSearch.pending('');
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #executeSearch.fulfilled, updates state using #handleFetchItemsFulfilled', () => {
    const searchResponse = buildSearchResponse();
    searchResponse.response.triggers = [
      buildMockQueryTrigger(),
      buildMockNotifyTrigger(),
      buildMockExecuteTrigger(),
      buildMockRedirectTrigger(),
    ];
    const action = executeSearch.fulfilled(searchResponse, '');
    expectedState = handleFetchItemsFulfilled(
      initialStateCopy,
      action.payload.response.triggers
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #applyQueryTriggerModification, updates state using #handleApplyQueryTriggerModification', () => {
    const action = applyQueryTriggerModification({
      newQuery: 'new query',
      originalQuery: 'original query',
    });
    expectedState = handleApplyQueryTriggerModification(
      initialStateCopy,
      action.payload
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #updateIgnoreQueryTrigger, updates state using #handleUpdateIgnoreQueryTrigger', () => {
    const action = updateIgnoreQueryTrigger({q: 'query to ignore'});
    expectedState = handleUpdateIgnoreQueryTrigger(
      initialStateCopy,
      action.payload.q
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });
});
