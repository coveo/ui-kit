import {combineReducers, ReducersMapObject, Reducer} from '@reduxjs/toolkit';

export interface ReducerManager {
  combinedReducer: Reducer;
  add: (newReducers: ReducersMapObject) => void;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = {...initialReducers};

  return {
    combinedReducer() {
      return combineReducers(reducers);
    },

    add(newReducers: ReducersMapObject) {
      Object.keys(newReducers)
        .filter((key) => !(key in reducers))
        .forEach((key) => (reducers[key] = newReducers[key]));
    },
  };
}
