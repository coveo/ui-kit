import {advancedSearchQueriesReducer} from './advanced-search-queries-slice';
import {updateAdvancedSearchQueries} from './advanced-search-queries-actions';
import {change} from '../history/history-actions';
import {
  AdvancedSearchQueriesState,
  getAdvancedSearchQueriesInitialState,
} from './advanced-search-queries-state';
import {getHistoryInitialState} from '../history/history-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

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
    const expected = {aq: aq, cq: null};
    const action = updateAdvancedSearchQueries({aq: aq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries when setting cq, does not modify aq which is not in initial state', () => {
    const expected = {aq: aq, cq: cq};
    const action = updateAdvancedSearchQueries({cq: cq});
    state = {aq: aq, cq: ''};
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('allows a restore query on history change', () => {
    const expectedQuery: AdvancedSearchQueriesState = {
      cq: 'hello',
      aq: 'hola',
    };
    const historyChange = {
      ...getHistoryInitialState(),
      advancedSearchQueries: expectedQuery,
    };

    const nextState = advancedSearchQueriesReducer(
      state,
      change.fulfilled(historyChange, '')
    );
    expect(nextState).toEqual(expectedQuery);
  });

  describe('#restoreSearchParameters', () => {
    it('when the object contains an #aq key, it sets the value in state', () => {
      state.aq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({aq: ''})
      );
      expect(finalState.aq).toEqual('');
    });

    it('when the object does not contain a #aq key, it does not update the property in state', () => {
      state.aq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({})
      );
      expect(finalState.aq).toEqual(state.aq);
    });

    it('when the object contains an #cq key, it sets the value in state', () => {
      state.cq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({cq: ''})
      );
      expect(finalState.cq).toEqual('');
    });

    it('when the object does not contain a #cq key, it does not update the property in state', () => {
      state.cq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({})
      );
      expect(finalState.cq).toEqual(state.cq);
    });
  });
});
