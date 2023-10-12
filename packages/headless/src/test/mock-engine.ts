import {
  AnyAction,
  ThunkDispatch,
  getDefaultMiddleware,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';
import {Logger, pino} from 'pino';
import configureStore, {MockStoreCreator} from 'redux-mock-store';
import thunk from 'redux-thunk';
import {SearchAPIClient} from '../api/search/search-api-client.js';
import {InsightAPIClient} from '../api/service/insight/insight-api-client.js';
import {analyticsMiddleware} from '../app/analytics-middleware.js';
import {CommerceEngine} from '../app/commerce-engine/commerce-engine.js';
import {CoreEngine} from '../app/engine.js';
import {InsightEngine} from '../app/insight-engine/insight-engine.js';
import {InsightThunkExtraArguments} from '../app/insight-thunk-extra-arguments.js';
import {instantlyCallableThunkActionMiddleware} from '../app/instantly-callable-middleware.js';
import {
  logActionErrorMiddleware,
  logActionMiddleware,
} from '../app/logger-middlewares.js';
import {ProductListingEngine} from '../app/product-listing-engine/product-listing-engine.js';
import {ProductRecommendationEngine} from '../app/product-recommendation-engine/product-recommendation-engine.js';
import {RecommendationEngine} from '../app/recommendation-engine/recommendation-engine.js';
import {SearchEngine} from '../app/search-engine/search-engine.js';
import {SearchThunkExtraArguments} from '../app/search-thunk-extra-arguments.js';
import {CaseAssistEngine} from '../case-assist.index.js';
import {CaseAssistAppState} from '../state/case-assist-app-state.js';
import {CommerceAppState} from '../state/commerce-app-state.js';
import {InsightAppState} from '../state/insight-app-state.js';
import {ProductListingAppState} from '../state/product-listing-app-state.js';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state.js';
import {RecommendationAppState} from '../state/recommendation-app-state.js';
import {SearchAppState} from '../state/search-app-state.js';
import {validatePayloadAndThrow} from '../utils/validate-payload.js';
import {buildMockCaseAssistState} from './mock-case-assist-state.js';
import {buildMockCommerceState} from './mock-commerce-state.js';
import {buildMockInsightAPIClient} from './mock-insight-api-client.js';
import {buildMockInsightState} from './mock-insight-state.js';
import {buildMockProductListingState} from './mock-product-listing-state.js';
import {buildMockProductRecommendationsState} from './mock-product-recommendations-state.js';
import {createMockRecommendationState} from './mock-recommendation-state.js';
import {buildMockSearchAPIClient} from './mock-search-api-client.js';
import {createMockState} from './mock-state.js';

type AsyncActionCreator<ThunkArg> = ActionCreatorWithPreparedPayload<
  [string, ThunkArg],
  undefined,
  string,
  never,
  {arg: ThunkArg; requestId: string}
>;

type AnyApiClient = SearchAPIClient | InsightAPIClient;

type AppState =
  | SearchAppState
  | RecommendationAppState
  | ProductRecommendationsAppState
  | ProductListingAppState
  | CommerceAppState
  | CaseAssistAppState
  | InsightAppState;

interface MockEngine {
  actions: AnyAction[];
  findAsyncAction: <ThunkArg>(
    action: AsyncActionCreator<ThunkArg>
  ) => ReturnType<AsyncActionCreator<ThunkArg>> | undefined;
  apiClient: AnyApiClient;
}

type DispatchExts = ThunkDispatch<AppState, void, AnyAction>;

export interface MockSearchEngine
  extends SearchEngine<SearchAppState>,
    MockEngine {
  apiClient: SearchAPIClient;
}

/**
 * For internal use only.
 *
 * Returns a non-functional `SearchEngine`.
 * To be used only for unit testing controllers, not for functional tests.
 */
export function buildMockSearchAppEngine(
  config: Partial<SearchEngine<SearchAppState>> = {}
): MockSearchEngine {
  const engine = buildMockCoreEngine(config, createMockState);
  return {
    ...engine,
    executeFirstSearch: jest.fn(),
    executeFirstSearchAfterStandaloneSearchBoxRedirect: jest.fn(),
    apiClient: engine.apiClient as SearchAPIClient,
  };
}

export interface MockRecommendationEngine
  extends RecommendationEngine,
    MockEngine {}

/**
 * For internal use only.
 *
 * Returns a non-functional `RecommendationEngine`.
 * To be used only for unit testing controllers, not for functional tests.
 */
export function buildMockRecommendationAppEngine(
  config: Partial<RecommendationEngine<RecommendationAppState>> = {}
): MockRecommendationEngine {
  return buildMockCoreEngine(config, createMockRecommendationState);
}

export interface MockProductRecommendationEngine
  extends ProductRecommendationEngine,
    MockEngine {}

/**
 * For internal use only.
 *
 * Returns a non-functional `ProductRecommendationEngine`.
 * To be used only for unit testing controllers, not for functional tests.
 */
export function buildMockProductRecommendationsAppEngine(
  config: Partial<
    ProductRecommendationEngine<ProductRecommendationsAppState>
  > = {}
): MockProductRecommendationEngine {
  return buildMockCoreEngine(config, buildMockProductRecommendationsState);
}

export interface MockProductListingEngine
  extends ProductListingEngine<ProductListingAppState>,
    MockEngine {}

/**
 * For internal use only.
 *
 * Returns a non-functional `ProductListingEngine`.
 * To be used only for unit testing controllers, not for functional tests.
 */
export function buildMockProductListingEngine(
  config: Partial<ProductListingEngine<ProductListingAppState>> = {}
): MockProductListingEngine {
  return buildMockCoreEngine(config, buildMockProductListingState);
}

export interface MockCommerceEngine
  extends CommerceEngine<CommerceAppState>,
    MockEngine {}

export function buildMockCommerceEngine(
  config: Partial<CommerceEngine<CommerceAppState>> = {}
): MockCommerceEngine {
  return buildMockCoreEngine(config, buildMockCommerceState);
}

export interface MockCaseAssistEngine
  extends CaseAssistEngine<CaseAssistAppState>,
    MockEngine {}

/**
 * For internal use only.
 *
 * Returns a non-functional `CaseAssistEngine`.
 * To be used only for unit testing controllers, not for functional tests.
 */
export function buildMockCaseAssistEngine(
  config: Partial<CaseAssistEngine<CaseAssistAppState>> = {}
): MockCaseAssistEngine {
  return buildMockCoreEngine(config, buildMockCaseAssistState);
}

export interface MockInsightEngine
  extends InsightEngine<InsightAppState>,
    MockEngine {}

export function buildMockInsightEngine(
  config: Partial<InsightEngine<InsightAppState>> = {}
): MockInsightEngine {
  const engine = buildMockCoreEngine(
    config,
    buildMockInsightState,
    configureInsightMockStore
  );
  return {
    ...engine,
    executeFirstSearch: jest.fn(),
  };
}

interface MockCoreEngine<T extends object> extends CoreEngine<T>, MockEngine {}

function buildMockCoreEngine<T extends AppState>(
  config: Partial<CoreEngine<T>> = {},
  mockState: () => T,
  buildStore: (
    logger: pino.Logger,
    state: AppState
  ) => {
    store: MockStoreCreator<AppState, DispatchExts>;
    apiClient: AnyApiClient;
  } = configureMockStore
): MockCoreEngine<T> {
  const logger = pino({level: 'silent'});
  const coreState = buildCoreState(config, mockState);
  const {store: storeConfiguration, apiClient} = buildStore(logger, coreState);
  const store = storeConfiguration(coreState);
  const unsubscribe = () => {};
  const {state, ...rest} = config;

  return {
    store,
    apiClient,
    state: buildCoreState(config, mockState),
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
    ...rest,
  };
}

function buildCoreState<T extends AppState>(
  config: Partial<CoreEngine<T>>,
  mockState: () => T
) {
  const state = config.state || mockState();
  state.configuration.analytics.enabled = false;
  return state;
}

const configureMockStore = (logger: Logger) => {
  const thunkExtraArguments: Omit<
    SearchThunkExtraArguments,
    'analyticsClientMiddleware'
  > = {
    apiClient: buildMockSearchAPIClient({logger}),
    validatePayload: validatePayloadAndThrow,
    logger,
  };
  return {
    //@ts-ignore redux&co don't play ball with Node ESM types
    store: configureStore<AppState, DispatchExts>([
      instantlyCallableThunkActionMiddleware,
      logActionErrorMiddleware(logger),
      analyticsMiddleware,
      //@ts-ignore redux&co don't play ball with Node ESM types
      thunk.withExtraArgument(thunkExtraArguments),
      ...getDefaultMiddleware(),
      logActionMiddleware(logger),
    ]),
    apiClient: thunkExtraArguments.apiClient,
  };
};

const configureInsightMockStore = (logger: Logger) => {
  const thunkExtraArguments: Omit<
    InsightThunkExtraArguments,
    'analyticsClientMiddleware'
  > = {
    apiClient: buildMockInsightAPIClient({logger}),
    validatePayload: validatePayloadAndThrow,
    logger,
  };
  return {
    //@ts-ignore redux&co don't play ball with Node ESM types
    store: configureStore<AppState, DispatchExts>([
      instantlyCallableThunkActionMiddleware,
      logActionErrorMiddleware(logger),
      analyticsMiddleware,
      //@ts-ignore redux&co don't play ball with Node ESM types
      thunk.withExtraArgument(thunkExtraArguments),
      ...getDefaultMiddleware(),
      logActionMiddleware(logger),
    ]),
    apiClient: thunkExtraArguments.apiClient,
  };
};

function isAsyncAction<ThunkArg>(
  action: AnyAction | undefined
): action is ReturnType<AsyncActionCreator<ThunkArg>> {
  return action ? 'meta' in action : false;
}
