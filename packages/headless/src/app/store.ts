import {Relay} from '@coveo/relay';
import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
  Reducer,
} from '@reduxjs/toolkit';
import {logActionMiddleware} from './logger-middlewares.js';
import {NavigatorContext} from './navigatorContextProvider.js';
import {ThunkExtraArguments} from './thunk-extra-arguments.js';

export interface CoreExtraArguments
  extends ThunkExtraArguments,
    AdditionalCoreExtraArguments {}

export interface AdditionalCoreExtraArguments {
  relay: Relay;
  navigatorContext: NavigatorContext;
}

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducer: Reducer;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
  thunkExtraArguments: CoreExtraArguments;
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
      getDefaultMiddleware({thunk: {extraArgument: thunkExtraArguments}})
        .prepend(...middlewares)
        .concat(logActionMiddleware(thunkExtraArguments.logger)),
  });
}

export type Store = ReturnType<typeof configureStore>;
