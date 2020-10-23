import {queryReducer} from './query-slice';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {updateQuery} from './query-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {change} from '../history/history-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {getQueryInitialState, QueryState} from './query-state';

describe('query slice', () => {
  it('should have initial state', () => {
    expect(queryReducer(undefined, {type: 'randomAction'})).toEqual(
      getQueryInitialState()
    );
  });

  describe('updateQuery', () => {
    const expectedState: QueryState = {
      ...getQueryInitialState(),
      q: 'some query',
    };

    it('should handle updateQuery on initial state', () => {
      expect(queryReducer(undefined, updateQuery({q: 'some query'}))).toEqual(
        expectedState
      );
    });

    it('should handle updateQuery on existing state', () => {
      const existingState: QueryState = {
        ...getQueryInitialState(),
        q: 'another query',
      };
      expect(
        queryReducer(existingState, updateQuery({q: 'some query'}))
      ).toEqual(expectedState);
    });
  });

  describe('updateQuery', () => {
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
      const existingState: QueryState = {
        ...getQueryInitialState(),
        q: 'some query',
      };
      expect(
        queryReducer(
          existingState,
          selectQuerySuggestion({id: 'id', expression: 'some expression'})
        )
      ).toEqual(expectedState);
    });
  });

  it('updates query on query correction', () => {
    const existingState: QueryState = {
      ...getQueryInitialState(),
      q: 'some query',
    };
    expect(
      queryReducer(existingState, applyDidYouMeanCorrection('corrected query'))
        .q
    ).toEqual('corrected query');
  });

  it('allows to restore a query on history change', () => {
    const state = getQueryInitialState();
    const expectedQuery = {q: 'foo'};
    const historyChange = {
      ...getHistoryEmptyState(),
      query: expectedQuery,
    };

    const nextState = queryReducer(state, change.fulfilled(historyChange, ''));

    expect(nextState).toEqual(expectedQuery);
  });
});
