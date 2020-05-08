import {queryReducer, updateQuery, getQueryInitialState} from './query-slice';
import {QueryState} from '../../state';

describe('query slice', () => {
  it('should have initial state', () => {
    expect(queryReducer(undefined, {type: 'randomAction'})).toEqual(
      getQueryInitialState()
    );
  });

  it('should handle updateQuery on initial state', () => {
    const expectedState: QueryState = {
      ...getQueryInitialState(),
      q: 'allo',
    };
    expect(queryReducer(undefined, updateQuery({q: 'allo'}))).toEqual(
      expectedState
    );
  });

  it('should handle updateQuery on existing state', () => {
    const existingState: QueryState = {
      ...getQueryInitialState(),
      q: 'allo',
    };
    const expectedState: QueryState = {
      ...getQueryInitialState(),
      q: 'test',
    };
    expect(queryReducer(existingState, updateQuery({q: 'test'}))).toEqual(
      expectedState
    );
  });
});
