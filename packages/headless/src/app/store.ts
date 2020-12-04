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
import {
  logActionErrorMiddleware,
  logActionMiddleware,
} from './logger-middlewares';
import {validatePayloadAndThrow} from '../utils/validate-payload';

export interface ThunkExtraArguments {
  searchAPIClient: SearchAPIClient;
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  logger: Logger;
  validatePayload: typeof validatePayloadAndThrow;
}

interface ConfigureStoreOptions<Reducers extends ReducersMapObject> {
  reducers: Reducers;
  preloadedState?: StateFromReducersMapObject<Reducers>;
  middlewares?: Middleware[];
  thunkExtraArguments: ThunkExtraArguments;
}

export function configureStore<Reducers extends ReducersMapObject>({
  reducers,
  preloadedState,
  middlewares = [],
  thunkExtraArguments,
}: ConfigureStoreOptions<Reducers>) {
  return configureStoreToolkit({
    reducer: combineReducers(reducers),
    preloadedState,
    devTools: {
      stateSanitizer: (state) =>
        (state as {history?: unknown}).history
          ? {...state, history: '<<OMIT>>'}
          : state,
    },
    middleware: (getDefaultMiddleware) => [
      logActionErrorMiddleware(thunkExtraArguments.logger),
      analyticsMiddleware,
      ...middlewares,
      ...getDefaultMiddleware({thunk: {extraArgument: thunkExtraArguments}}),
      logActionMiddleware(thunkExtraArguments.logger),
    ],
  });
}

export type Store = ReturnType<typeof configureStore>;
