import {
  configureStore as configureStoreToolkit,
  ReducersMapObject,
  combineReducers,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {SearchAPIClient} from '../api/search/search-api-client';
import {analyticsMiddleware} from './analytics-middleware';
import {Logger} from 'pino';

interface ThunkExtraArguments {
  searchAPIClient: SearchAPIClient;
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  logger: Logger;
}

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducers: Reducers;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
  thunkExtraArguments?: ThunkExtraArguments;
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
        (api) => (next) => (action) => {
          const result = next(action);

          thunkExtraArguments?.logger.debug(
            {
              action,
              nextState: api.getState(),
            },
            `@coveo/headless action dispatched: ${action.type}`
          );

          return result;
        },
      ];
    },
  });

  return store;
}

export type Store = ReturnType<typeof configureStore>;
