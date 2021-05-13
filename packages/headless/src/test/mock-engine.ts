import {Engine} from '../app/headless-engine';
import {createMockState} from './mock-state';
import configureStore from 'redux-mock-store';
import {
  AnyAction,
  ThunkDispatch,
  getDefaultMiddleware,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import {analyticsMiddleware} from '../app/analytics-middleware';
import {SearchAppState} from '../state/search-app-state';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {createMockRecommendationState} from './mock-recommendation-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {buildMockProductRecommendationsState} from './mock-product-recommendations-state';
import pino, {Logger} from 'pino';
import {
  logActionErrorMiddleware,
  logActionMiddleware,
} from '../app/logger-middlewares';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {buildMockSearchAPIClient} from './mock-search-api-client';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';
import {getDebugInitialState} from '../features/debug/debug-state';

type AsyncActionCreator<ThunkArg> = ActionCreatorWithPreparedPayload<
  [string, ThunkArg],
  undefined,
  string,
  never,
  {arg: ThunkArg; requestId: string}
>;

export type AppState =
  | SearchAppState
  | RecommendationAppState
  | ProductRecommendationsAppState;

export interface MockEngine<T extends AppState> extends Engine<T> {
  actions: AnyAction[];
  findAsyncAction: <ThunkArg>(
    action: AsyncActionCreator<ThunkArg>
  ) => ReturnType<AsyncActionCreator<ThunkArg>> | undefined;
}

type DispatchExts = ThunkDispatch<AppState, void, AnyAction>;

const mockRenewAccessToken = async () => '';

export function buildMockSearchAppEngine(
  config: Partial<Engine<SearchAppState>> = {}
): MockEngine<SearchAppState> {
  return buildMockEngine(config, createMockState);
}

export function buildMockRecommendationAppEngine(
  config: Partial<Engine<RecommendationAppState>> = {}
): MockEngine<RecommendationAppState> {
  return buildMockEngine(config, createMockRecommendationState);
}

export function buildMockProductRecommendationsAppEngine(
  config: Partial<Engine<ProductRecommendationsAppState>> = {}
): MockEngine<ProductRecommendationsAppState> {
  return buildMockEngine(config, buildMockProductRecommendationsState);
}

function buildMockEngine<T extends AppState>(
  config: Partial<Engine<T>> = {},
  mockState: () => T
): MockEngine<T> {
  const logger = pino({level: 'silent'});
  const storeConfiguration = configureMockStore(logger);
  const store = storeConfiguration(config.state || mockState());
  const unsubscribe = () => {};

  return {
    store,
    state: {
      ...mockState(),
      searchHub: getSearchHubInitialState(),
      pipeline: getPipelineInitialState(),
      debug: getDebugInitialState(),
    },
    subscribe: jest.fn(() => unsubscribe),
    get dispatch() {
      return store.dispatch;
    },
    get actions() {
      return store.getActions();
    },
    findAsyncAction<ThunkArg>(actionCreator: AsyncActionCreator<ThunkArg>) {
      const action = this.actions.find((a) => a.type === actionCreator.type);
      return isAsyncAction<ThunkArg>(action) ? action : undefined;
    },
    ...config,
    renewAccessToken: mockRenewAccessToken,
    logger,
    addReducers: jest.fn(),
  };
}

const configureMockStore = (logger: Logger) => {
  return configureStore<AppState, DispatchExts>([
    logActionErrorMiddleware(logger),
    analyticsMiddleware,
    thunk.withExtraArgument({
      searchAPIClient: buildMockSearchAPIClient({logger}),
      validatePayload: validatePayloadAndThrow,
      logger,
    }),
    ...getDefaultMiddleware(),
    logActionMiddleware(logger),
  ]);
};

function isAsyncAction<ThunkArg>(
  action: AnyAction | undefined
): action is ReturnType<AsyncActionCreator<ThunkArg>> {
  return action ? 'meta' in action : false;
}
