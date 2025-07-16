import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {updateQuery} from './query-actions.js';
import {queryReducer} from './query-slice.js';
import {
  type CommerceQueryState,
  getCommerceQueryInitialState,
} from './query-state.js';

describe('query slice', () => {
  let state: CommerceQueryState;

  beforeEach(() => {
    state = getCommerceQueryInitialState();
  });

  it('should have initial state', () => {
    expect(queryReducer(undefined, {type: ''})).toEqual({
      query: '',
    });
  });

  describe('#updateQuery', () => {
    const expectedState: CommerceQueryState = {
      query: 'some query',
    };

    it('should handle updateQuery on initial state', () => {
      expect(queryReducer(state, updateQuery({query: 'some query'}))).toEqual(
        expectedState
      );
    });

    it('should handle updateQuery on existing state', () => {
      state.query = 'another query';

      expect(queryReducer(state, updateQuery({query: 'some query'}))).toEqual(
        expectedState
      );
    });
  });

  describe('#restoreSearchParameters', () => {
    it('sets the query to the payload', () => {
      expect(
        queryReducer(state, restoreSearchParameters({q: 'new query'}))
      ).toEqual({
        query: 'new query',
      });
    });

    it('default to empty string if no query in payload', () => {
      expect(queryReducer(state, restoreSearchParameters({})).query).toBe('');
    });
  });

  it('#selectQuerySuggestion sets the query to the payload', () => {
    expect(queryReducer(state, updateQuery({query: 'some query'}))).toEqual({
      query: 'some query',
    });
  });
});
