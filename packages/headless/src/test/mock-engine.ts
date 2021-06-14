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
import {SearchEngine} from '../app/search-engine/search-engine';
import {RecommendationEngine} from '../app/recommendation-engine/recommendation-engine';
import {CoreEngine} from '../app/engine';
import {ProductRecommendationEngine} from '../app/product-recommendation-engine/product-recommendation-engine';

type AsyncActionCreator<ThunkArg> = ActionCreatorWithPreparedPayload<
  [string, ThunkArg],
  undefined,
  string,
  never,
  {arg: ThunkArg; requestId: string}
>;

type AppState =
  | SearchAppState
  | RecommendationAppState
  | ProductRecommendationsAppState;

interface MockEngine {
  actions: AnyAction[];
  findAsyncAction: <ThunkArg>(
    action: AsyncActionCreator<ThunkArg>
  ) => ReturnType<AsyncActionCreator<ThunkArg>> | undefined;
}

type DispatchExts = ThunkDispatch<AppState, void, AnyAction>;

export interface MockSearchEngine
  extends SearchEngine<SearchAppState>,
    MockEngine {}

export function buildMockSearchAppEngine(
  config: Partial<SearchEngine<SearchAppState>> = {}
): MockSearchEngine {
  const engine = buildMockCoreEngine(config, createMockState);
  return {
    ...engine,
    executeFirstSearch: jest.fn(),
  };
}

export interface MockRecommendationEngine
  extends RecommendationEngine,
    MockEngine {}

export function buildMockRecommendationAppEngine(
  config: Partial<RecommendationEngine<RecommendationAppState>> = {}
): MockRecommendationEngine {
  return buildMockCoreEngine(config, createMockRecommendationState);
}

export interface MockProductRecommendationEngine
  extends ProductRecommendationEngine,
    MockEngine {}

export function buildMockProductRecommendationsAppEngine(
  config: Partial<
    ProductRecommendationEngine<ProductRecommendationsAppState>
  > = {}
): MockProductRecommendationEngine {
  return buildMockCoreEngine(config, buildMockProductRecommendationsState);
}

interface MockCoreEngine<T> extends CoreEngine<T>, MockEngine {}

function buildMockCoreEngine<T extends AppState>(
  config: Partial<CoreEngine<T>> = {},
  mockState: () => T
): MockCoreEngine<T> {
  const logger = pino({level: 'silent'});
  const storeConfiguration = configureMockStore(logger);
  const store = storeConfiguration(config.state || mockState());
  const unsubscribe = () => {};

  return {
    store,
    state: mockState(),
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
    logger,
    addReducers: jest.fn(),
    enableAnalytics: jest.fn(),
    disableAnalytics: jest.fn(),
    ...config,
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
