import {queryReducer, updateQuery, getQueryInitialState} from './query-slice';
import {QueryState} from '../../state';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-slice';

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
});
