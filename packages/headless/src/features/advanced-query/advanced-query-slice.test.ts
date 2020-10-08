import {
  getInitialAdvancedQueryState,
  advancedQueryReducer,
} from './advanced-query-slice';
import {AdvancedQueryState} from '../../state';
import {updateAdvancedQuery} from './advanced-query-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {change} from '../history/history-actions';

describe('Advanced query slice', () => {
  const aq = 'mock-aq';
  let state: AdvancedQueryState;

  beforeEach(() => {
    state = getInitialAdvancedQueryState();
  });

  it('#updateAdvancedQuery sets aq to the correct value', () => {
    const action = updateAdvancedQuery(aq);
    state = advancedQueryReducer(state, action);
    expect(state.aq).toBe(aq);
  });

  it('allows a restore query on history change', () => {
    const state = getInitialAdvancedQueryState();
    const expectedQuery: AdvancedQueryState = {
      aq: 'mock-aq',
    };
    const historyChange = {
      ...getHistoryEmptyState(),
      advancedQuery: expectedQuery,
    };
    const nextState = advancedQueryReducer(
      state,
      change.fulfilled(historyChange, '')
    );
    expect(nextState).toEqual(expectedQuery);
  });
});
