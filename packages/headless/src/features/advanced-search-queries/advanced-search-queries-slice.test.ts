import {advancedSearchQueriesReducer} from './advanced-search-queries-slice';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from './advanced-search-queries-actions';
import {change} from '../history/history-actions';
import {
  AdvancedSearchQueriesState,
  getAdvancedSearchQueriesInitialState,
} from './advanced-search-queries-state';
import {getHistoryInitialState} from '../history/history-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';

describe('advanced search parameters', () => {
  const defaultCq = 'mock-default-cq';
  const cq = 'mock-cq';
  const defaultAq = 'mock-default-aq';
  const aq = 'mock-aq';
  const defaultLq = 'mock-default-lq';
  const lq = 'mock-lq';
  let state: AdvancedSearchQueriesState;

  beforeEach(() => {
    state = getAdvancedSearchQueriesInitialState();
  });

  it('#updateAdvancedSearchQueries sets aq and cq to the correct values', () => {
    const expected = buildMockAdvancedSearchQueriesState({
      aq,
      cq,
      lq,
      aqWasSet: true,
      cqWasSet: true,
      lqWasSet: true,
    });
    const action = updateAdvancedSearchQueries({aq, cq, lq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries sets only cq to the correct values', () => {
    const expected = buildMockAdvancedSearchQueriesState({cq, cqWasSet: true});
    const action = updateAdvancedSearchQueries({cq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries sets only aq to the correct values', () => {
    const expected = buildMockAdvancedSearchQueriesState({aq, aqWasSet: true});
    const action = updateAdvancedSearchQueries({aq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries sets only lq to the correct values', () => {
    const expected = buildMockAdvancedSearchQueriesState({lq, lqWasSet: true});
    const action = updateAdvancedSearchQueries({lq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries when setting cq, does not modify aq or lq which is not in initial state', () => {
    const expected = buildMockAdvancedSearchQueriesState({
      aq,
      cq,
      lq,
      cqWasSet: true,
    });
    const action = updateAdvancedSearchQueries({cq});
    state = buildMockAdvancedSearchQueriesState({aq, lq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries when setting aq, does not modify cq or lq which is not in initial state', () => {
    const expected = buildMockAdvancedSearchQueriesState({
      cq,
      aq,
      lq,
      aqWasSet: true,
    });
    const action = updateAdvancedSearchQueries({aq});
    state = buildMockAdvancedSearchQueriesState({cq, lq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it('#updateAdvancedSearchQueries when setting lq, does not modify cq or aq which is not in initial state', () => {
    const expected = buildMockAdvancedSearchQueriesState({
      cq,
      lq,
      aq,
      lqWasSet: true,
    });
    const action = updateAdvancedSearchQueries({lq});
    state = buildMockAdvancedSearchQueriesState({cq, aq});
    state = advancedSearchQueriesReducer(state, action);

    expect(state).toEqual(expected);
  });

  it("#registerAdvancedSearchQueries when setting a default aq, modifies aq when it's unset", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState(),
      registerAdvancedSearchQueries({aq: defaultAq})
    );

    expect(state.aq).toEqual(defaultAq);
  });

  it("#registerAdvancedSearchQueries when setting a default cq, modifies cq when it's unset", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState(),
      registerAdvancedSearchQueries({cq: defaultCq})
    );

    expect(state.cq).toEqual(defaultCq);
  });

  it("#registerAdvancedSearchQueries when setting a default lq, modifies lq when it's unset", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState(),
      registerAdvancedSearchQueries({lq: defaultLq})
    );

    expect(state.lq).toEqual(defaultLq);
  });

  it('#registerAdvancedSearchQueries when setting a default aq, cq, and lq, modifies aq, cq, and lq when they are unset', () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState(),
      registerAdvancedSearchQueries({
        aq: defaultAq,
        cq: defaultCq,
        lq: defaultLq,
      })
    );

    expect(state.aq).toEqual(defaultAq);
    expect(state.cq).toEqual(defaultCq);
    expect(state.lq).toEqual(defaultLq);
  });

  it("#registerAdvancedSearchQueries when setting a default aq, does not modify aq when it's set", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState({aqWasSet: true}),
      registerAdvancedSearchQueries({aq: defaultAq})
    );

    expect(state.aq).toEqual('');
  });

  it("#registerAdvancedSearchQueries when setting a default cq, does not modify cq when it's set", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState({cqWasSet: true}),
      registerAdvancedSearchQueries({cq: defaultCq})
    );

    expect(state.cq).toEqual('');
  });

  it("#registerAdvancedSearchQueries when setting a default lq, does not modify lq when it's set", () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState({lqWasSet: true}),
      registerAdvancedSearchQueries({lq: defaultLq})
    );

    expect(state.lq).toEqual('');
  });

  it('#registerAdvancedSearchQueries when setting a default aq, cq, and lq, does not modify aq, cq, and lq when they are set', () => {
    state = advancedSearchQueriesReducer(
      buildMockAdvancedSearchQueriesState({
        aqWasSet: true,
        cqWasSet: true,
        lqWasSet: true,
      }),
      registerAdvancedSearchQueries({
        aq: defaultAq,
        cq: defaultCq,
        lq: defaultLq,
      })
    );

    expect(state.aq).toEqual('');
    expect(state.cq).toEqual('');
    expect(state.lq).toEqual('');
  });

  it('allows a restore query on history change', () => {
    const expectedQuery: AdvancedSearchQueriesState =
      buildMockAdvancedSearchQueriesState({
        cq: 'hello',
        aq: 'hola',
        lq: 'hallo',
      });
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

    it('when the object does not contain a #lq key, it does not update the property in state', () => {
      state.lq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({})
      );
      expect(finalState.lq).toEqual(state.lq);
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

    it('when the object does not contain a #lq key, it does not update the property in state', () => {
      state.lq = 'a';
      const finalState = advancedSearchQueriesReducer(
        state,
        restoreSearchParameters({})
      );
      expect(finalState.lq).toEqual(state.lq);
    });
  });
});
