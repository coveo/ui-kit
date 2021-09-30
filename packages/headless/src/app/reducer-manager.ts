import {combineReducers, ReducersMapObject, Reducer} from '@reduxjs/toolkit';

export interface ReducerManager {
  combinedReducer: Reducer;
  add: (newReducers: ReducersMapObject) => void;
  containsAll(newReducers: ReducersMapObject): boolean;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = {...initialReducers};

  return {
    get combinedReducer() {
      return combineReducers(reducers);
    },

    containsAll(newReducers: ReducersMapObject) {
      const keys = Object.keys(newReducers);
      return keys.every((key) => key in reducers);
    },

    add(newReducers: ReducersMapObject) {
      Object.keys(newReducers)
        .filter((key) => !(key in reducers))
        .forEach((key) => (reducers[key] = newReducers[key]));
    },
  };
}
