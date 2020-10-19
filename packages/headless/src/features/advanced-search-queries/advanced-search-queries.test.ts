import {
  getAdvancedSearchQueriesInitialState,
  advancedSearchQueriesReducer,
} from './advanced-search-queries-slice';
import {AdvancedSearchQueriesState} from '../../state';
import {updateAdvancedSearchQueries} from './advanced-search-queries-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {change} from '../history/history-actions';

describe('advanced search parameters', () => {
  const cq = 'mock-cq';
  const aq = 'mock-aq';
  let state: AdvancedSearchQueriesState;

  beforeEach(() => {
    state = getAdvancedSearchQueriesInitialState();
  });

  it('#updateAdvancedSearchQueries sets aq and cq to the correct values', () => {
    const expected = {aq: aq, cq: cq};
    const action = updateAdvancedSearchQueries({aq: aq, cq: cq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries sets only cq to the correct values', () => {
    const expected = {aq: '', cq: cq};
    const action = updateAdvancedSearchQueries({cq: cq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries sets only aq to the correct values', () => {
    const expected = {aq: aq, cq: ''};
    const action = updateAdvancedSearchQueries({aq: aq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('allows a restore query on history change', () => {
    const expectedQuery: AdvancedSearchQueriesState = {
      cq: 'hello',
      aq: 'hola',
    };
    const historyChange = {
      ...getHistoryEmptyState(),
      advancedSearchQueries: expectedQuery,
    };

    const nextState = advancedSearchQueriesReducer(
      state,
      change.fulfilled(historyChange, '')
    );
    expect(nextState).toEqual(expectedQuery);
  });
});
