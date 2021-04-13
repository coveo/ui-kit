import {combineReducers, ReducersMapObject, Reducer} from '@reduxjs/toolkit';

export interface ReducerManager {
  reducer: Reducer;
  add: (newReducers: ReducersMapObject) => void;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = {...initialReducers};

  return {
    get reducer() {
      return combineReducers(reducers);
    },

    add(newReducers: ReducersMapObject) {
      Object.keys(newReducers)
        .filter((key) => !(key in reducers))
        .forEach((key) => (reducers[key] = newReducers[key]));
    },
  };
}
