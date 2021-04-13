import {combineReducers, ReducersMapObject, Reducer} from '@reduxjs/toolkit';

export interface ReducerManager {
  reducer: Reducer;
  combine: (newReducers: ReducersMapObject) => Reducer;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  let reducers = {...initialReducers};

  return {
    get reducer() {
      return combineReducers(reducers);
    },

    combine(newReducers: ReducersMapObject) {
      reducers = {...newReducers, ...reducers};
      return this.reducer;
    },
  };
}
