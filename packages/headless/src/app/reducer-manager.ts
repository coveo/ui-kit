import {combineReducers, ReducersMapObject, Reducer} from '@reduxjs/toolkit';

export interface ReducerManager {
  combinedReducer: Reducer;
  add: (newReducers: ReducersMapObject) => void;
  contains: (newReducers: ReducersMapObject) => boolean;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = {...initialReducers};

  return {
    get combinedReducer() {
      return combineReducers(reducers);
    },

    add(newReducers: ReducersMapObject) {
      Object.keys(newReducers)
        .filter((key) => !(key in reducers))
        .forEach((key) => (reducers[key] = newReducers[key]));
    },
    contains(newReducers: ReducersMapObject) {
      return Object.keys(newReducers).every((key) => key in reducers);
    },
  };
}
