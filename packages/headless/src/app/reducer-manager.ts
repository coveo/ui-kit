import {
  type AnyAction,
  combineReducers,
  type Reducer,
  type ReducersMapObject,
  type StateFromReducersMapObject,
} from '@reduxjs/toolkit';
import {fromEntries} from '../utils/utils.js';

export interface ReducerManager {
  combinedReducer: Reducer;
  add(newReducers: ReducersMapObject): void;
  containsAll(newReducers: ReducersMapObject): boolean;
  addCrossReducer(reducer: Reducer): void;
}

export function createReducerManager(
  initialReducers: ReducersMapObject,
  preloadedState: object
): ReducerManager {
  const reducers = {...initialReducers};
  let crossReducer: Reducer;

  const rootReducer: (
    combined: Reducer<StateFromReducersMapObject<ReducersMapObject>, AnyAction>
  ) => Reducer = (combined) => {
    return (state, action) => {
      const intermediate = combined(state, action);
      const final = crossReducer
        ? crossReducer(intermediate, action)
        : intermediate;
      return final;
    };
  };

  return {
    get combinedReducer() {
      const placeholderReducers = fromEntries(
        Object.entries(preloadedState)
          .filter(([key]) => !(key in reducers))
          .map(([key, value]) => [key, <Reducer>(() => value)])
      );
      return rootReducer(
        combineReducers({...placeholderReducers, ...reducers})
      );
    },

    containsAll(newReducers: ReducersMapObject) {
      const keys = Object.keys(newReducers);
      return keys.every((key) => key in reducers);
    },

    add(newReducers: ReducersMapObject) {
      Object.keys(newReducers)
        .filter((key) => !(key in reducers))
        .forEach((key) => {
          reducers[key] = newReducers[key];
        });
    },

    addCrossReducer(reducer: Reducer) {
      crossReducer = reducer;
    },
  };
}
