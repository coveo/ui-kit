import {queryReducer} from './query-slice';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {updateQuery} from './query-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {change} from '../history/history-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {getQueryInitialState, QueryState} from './query-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

describe('query slice', () => {
  let state: QueryState;

  beforeEach(() => {
    state = getQueryInitialState();
  });

  it('should have initial state', () => {
    expect(queryReducer(undefined, {type: 'randomAction'})).toEqual({
      q: '',
      enableQuerySyntax: false,
    });
  });

  describe('updateQuery', () => {
    const expectedState: QueryState = {
      ...getQueryInitialState(),
      q: 'some query',
    };

    it('should handle updateQuery on initial state', () => {
      expect(queryReducer(state, updateQuery({q: 'some query'}))).toEqual(
        expectedState
      );
    });

    it('should be able to update enableQuerySyntax', () => {
      const enableQuerySyntax = !state.enableQuerySyntax;
      const action = updateQuery({enableQuerySyntax});

      expect(queryReducer(state, action)).toEqual({
        ...state,
        enableQuerySyntax,
      });
    });

    it('should handle updateQuery on existing state', () => {
      state.q = 'another query';

      expect(queryReducer(state, updateQuery({q: 'some query'}))).toEqual(
        expectedState
      );
    });
  });

  describe('selectQuerySuggestion', () => {
    const expectedState: QueryState = {
      ...getQueryInitialState(),
      q: 'some expression',
    };

    it('should handle updateQuery on initial state', () => {
      expect(
        queryReducer(
          undefined,
          selectQuerySuggestion({id: 'id', expression: 'some expression'})
        )
      ).toEqual(expectedState);
    });

    it('should handle updateQuery on existing state', () => {
      state.q = 'some query';

      expect(
        queryReducer(
          state,
          selectQuerySuggestion({id: 'id', expression: 'some expression'})
        )
      ).toEqual(expectedState);
    });
  });

  it('updates query on query correction', () => {
    state.q = 'some query';

    expect(
      queryReducer(state, applyDidYouMeanCorrection('corrected query')).q
    ).toEqual('corrected query');
  });

  it('allows to restore a query on history change', () => {
    const expectedQuery = {q: 'foo', enableQuerySyntax: true};

    const historyChange = {
      ...getHistoryEmptyState(),
      query: expectedQuery,
    };

    const nextState = queryReducer(state, change.fulfilled(historyChange, ''));

    expect(nextState).toEqual(expectedQuery);
  });

  describe('#restoreSearchParameters', () => {
    it('when the object contains a #q key, it sets the value in state', () => {
      state.q = 'a';
      const finalState = queryReducer(state, restoreSearchParameters({q: ''}));
      expect(finalState.q).toEqual('');
    });

    it('when the object does not contain a #q key, it does not update the query', () => {
      state.q = 'a';
      const finalState = queryReducer(state, restoreSearchParameters({}));
      expect(finalState.q).toEqual(state.q);
    });

    it('when the object contains an #enableQuerySyntax key, it sets the value in state', () => {
      state.enableQuerySyntax = true;
      const finalState = queryReducer(
        state,
        restoreSearchParameters({enableQuerySyntax: false})
      );
      expect(finalState.enableQuerySyntax).toEqual(false);
    });

    it('when the object does not contain an #enableQuerySyntax key, it does not update the state', () => {
      state.enableQuerySyntax = true;
      const finalState = queryReducer(state, restoreSearchParameters({}));
      expect(finalState.enableQuerySyntax).toEqual(state.enableQuerySyntax);
    });
  });
});
