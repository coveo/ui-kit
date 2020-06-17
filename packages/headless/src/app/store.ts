import {
  configureStore as configureStoreToolkit,
  getDefaultMiddleware,
  ReducersMapObject,
  combineReducers,
  StateFromReducersMapObject,
} from '@reduxjs/toolkit';

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducers: Reducers;
  preloadedState?: StateFromReducersMapObject<Reducers>;
}

export function configureStore<Reducers extends ReducersMapObject>({
  reducers,
  preloadedState,
}: ConfigureStoreOptions<Reducers>) {
  const store = configureStoreToolkit({
    reducer: combineReducers(reducers),
    preloadedState,
    middleware: [...getDefaultMiddleware()],
  });

  return store;
}

export type Store = ReturnType<typeof configureStore>;
