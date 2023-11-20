import {updateQuery} from './query-actions';
import {queryReducer} from './query-slice';
import {CommerceQueryState, getCommerceQueryInitialState} from './query-state';

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

  describe('updateQuery', () => {
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
});
