import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {createReducerManager} from './reducer-manager';
import {pagination, search} from './reducers';

describe('ReducerManager', () => {
  it('when a key does not exist, #add stores the key-reducer pair', () => {
    const manager = createReducerManager({});
    manager.add({pagination});

    const state = manager.reducer(undefined, {type: ''});
    expect(state).toEqual({pagination: getPaginationInitialState()});
  });

  it('when a key exists, calling #add with the same key does not overwrite the existing reducer', () => {
    const manager = createReducerManager({pagination});
    manager.add({pagination: search});

    const state = manager.reducer(undefined, {type: ''});
    expect(state).toEqual({pagination: getPaginationInitialState()});
  });
});
