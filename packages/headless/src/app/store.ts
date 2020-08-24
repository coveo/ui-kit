import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  combineReducers,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {analyticsMiddleware} from './analytics-middleware';

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducers: Reducers;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
  thunkExtraArguments?: unknown;
}

export function configureStore<Reducers extends ReducersMapObject>({
  reducers,
  preloadedState,
  middlewares = [],
  thunkExtraArguments,
}: ConfigureStoreOptions<Reducers>) {
  const store = configureStoreToolkit({
    reducer: combineReducers(reducers),
    preloadedState,
    devTools: {
      stateSanitizer: (state) =>
        (state as {history?: unknown}).history
          ? {...state, history: '<<OMIT>>'}
          : state,
    },
    middleware: (getDefaultMiddleware) => {
      return [
        analyticsMiddleware,
        ...middlewares,
        ...getDefaultMiddleware({thunk: {extraArgument: thunkExtraArguments}}),
      ];
    },
  });

  return store;
}

export type Store = ReturnType<typeof configureStore>;
