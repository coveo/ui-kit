import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
  Reducer,
} from '@reduxjs/toolkit';
import {logActionMiddleware} from './logger-middlewares';
import {ThunkExtraArguments} from './thunk-extra-arguments';

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducer: Reducer;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
  thunkExtraArguments: ThunkExtraArguments;
  name: string;
}

export function configureStore<Reducers extends ReducersMapObject>({
  reducer,
  preloadedState,
  middlewares = [],
  thunkExtraArguments,
  name,
}: ConfigureStoreOptions<Reducers>) {
  return configureStoreToolkit({
    reducer,
    preloadedState,
    devTools: {
      stateSanitizer: (state) =>
        (state as {history?: unknown}).history
          ? {...state, history: '<<OMIT>>'}
          : state,
      name,
    },
    middleware: (getDefaultMiddleware) => [
      ...middlewares,
      ...getDefaultMiddleware({thunk: {extraArgument: thunkExtraArguments}}),
      logActionMiddleware(thunkExtraArguments.logger),
    ],
  });
}

export type Store = ReturnType<typeof configureStore>;
