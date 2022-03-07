import {
  combineReducers,
  ReducersMapObject,
  Reducer,
  AnyAction,
} from '@reduxjs/toolkit';

export interface ReducerManager {
  combinedReducer: Reducer;
  add(newReducers: ReducersMapObject): void;
  containsAll(newReducers: ReducersMapObject): boolean;
  addCrossSlice(crossSliceReuder: Reducer): void;
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = {...initialReducers};
  let crossSlice: Reducer;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootReducer: (combined: Reducer<any, AnyAction>) => Reducer = (
    combined
  ) => {
    return (state, action) => {
      const intermediate = combined(state, action);
      const final = crossSlice
        ? crossSlice(intermediate, action)
        : intermediate;
      return final;
    };
  };

  return {
    get combinedReducer() {
      return rootReducer(combineReducers(reducers));
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

    addCrossSlice(crossSliceReducer: Reducer) {
      crossSlice = crossSliceReducer;
    },
  };
}
