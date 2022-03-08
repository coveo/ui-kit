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

  it('when all keys exist, #containsAll returns true', () => {
    const manager = createReducerManager({pagination, search});
    expect(manager.containsAll({pagination, search})).toBe(true);
  });

  it('when only some keys exist, #containsAll returns false', () => {
    const manager = createReducerManager({pagination});
    expect(manager.containsAll({pagination, search})).toBe(false);
  });

  it('should call root reducer when configured', () => {
    const manager = createReducerManager({pagination});
    const rootReducer = jest.fn();
    manager.addCrossReducer(rootReducer);
    manager.combinedReducer(undefined, {type: ''});
    expect(rootReducer).toHaveBeenCalled();
  });
});
