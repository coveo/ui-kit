import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {createReducerManager} from './reducer-manager';
import {pagination, search} from './reducers';

describe('ReducerManager', () => {
  it('when a key does not exist, #add stores the key-reducer pair', () => {
    const manager = createReducerManager({});
    manager.add({pagination});

    const state = manager.combinedReducer(undefined, {type: ''});
    expect(state).toEqual({pagination: getPaginationInitialState()});
  });

  it('when a key exists, calling #add with the same key does not overwrite the existing reducer', () => {
    const manager = createReducerManager({pagination});
    manager.add({pagination: search});

    const state = manager.combinedReducer(undefined, {type: ''});
    expect(state).toEqual({pagination: getPaginationInitialState()});
  });

  it('when a key exists, calling #contains returns true', () => {
    const manager = createReducerManager({pagination});
    expect(manager.contains({pagination})).toBe(true);
  });

  it('when a key does not exists, calling #contains returns false', () => {
    const manager = createReducerManager({pagination});
    expect(manager.contains({search})).toBe(false);
  });

  it('when one key does not exists, calling #contains returns false', () => {
    const manager = createReducerManager({pagination});
    expect(manager.contains({search, pagination})).toBe(false);
  });

  it('when all key exists, calling #contains returns true', () => {
    const manager = createReducerManager({pagination, search});
    expect(manager.contains({search, pagination})).toBe(true);
  });
});
