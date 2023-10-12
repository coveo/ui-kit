import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
  Reducer,
  Tuple,
} from '@reduxjs/toolkit';
import {logActionMiddleware} from './logger-middlewares.js';
import {ThunkExtraArguments} from './thunk-extra-arguments.js';

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
      shouldHotReload: false, // KIT-961 -> Redux dev tool + hot reloading interacts badly with replaceReducers mechanism.
    },
    middleware: (getDefaultMiddleware) =>
      new Tuple(
        ...middlewares,
        ...getDefaultMiddleware({thunk: {extraArgument: thunkExtraArguments}}),
        logActionMiddleware(thunkExtraArguments.logger)
      ),
  });
}

export type Store = ReturnType<typeof configureStore>;
