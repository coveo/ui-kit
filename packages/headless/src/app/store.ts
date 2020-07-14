import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  combineReducers,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducers: Reducers;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
}

export function configureStore<Reducers extends ReducersMapObject>({
  reducers,
  preloadedState,
  middlewares = [],
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
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(middlewares),
  });

  return store;
}

export type Store = ReturnType<typeof configureStore>;
