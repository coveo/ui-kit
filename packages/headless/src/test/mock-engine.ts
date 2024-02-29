import {Relay} from '@coveo/relay';
import {
  AnyAction,
  ThunkDispatch,
  getDefaultMiddleware,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';
import pino, {Logger} from 'pino';
import configureStore, {MockStoreCreator} from 'redux-mock-store';
import thunk from 'redux-thunk';
import {SearchAPIClient} from '../api/search/search-api-client';
import {InsightAPIClient} from '../api/service/insight/insight-api-client';
import {analyticsMiddleware} from '../app/analytics-middleware';
import {CaseAssistEngine} from '../app/case-assist-engine/case-assist-engine';
import {CommerceEngine} from '../app/commerce-engine/commerce-engine';
import {CoreEngine} from '../app/engine';
import {InsightEngine} from '../app/insight-engine/insight-engine';
import {InsightThunkExtraArguments} from '../app/insight-thunk-extra-arguments';
import {instantlyCallableThunkActionMiddleware} from '../app/instantly-callable-middleware';
import {
  logActionErrorMiddleware,
  logActionMiddleware,
} from '../app/logger-middlewares';
import {ProductListingEngine} from '../app/product-listing-engine/product-listing-engine';
import {ProductRecommendationEngine} from '../app/product-recommendation-engine/product-recommendation-engine';
import {RecommendationEngine} from '../app/recommendation-engine/recommendation-engine';
import {SearchEngine} from '../app/search-engine/search-engine';
import {SearchCompletedAction} from '../app/search-engine/search-engine.ssr';
import {SearchThunkExtraArguments} from '../app/search-thunk-extra-arguments';
import {CaseAssistAppState} from '../state/case-assist-app-state';
import {CommerceAppState} from '../state/commerce-app-state';
import {InsightAppState} from '../state/insight-app-state';
import {ProductListingAppState} from '../state/product-listing-app-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {SearchAppState} from '../state/search-app-state';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {buildMockCaseAssistState} from './mock-case-assist-state';
import {buildMockCommerceState} from './mock-commerce-state';
import {buildMockInsightAPIClient} from './mock-insight-api-client';
import {buildMockInsightState} from './mock-insight-state';
import {buildMockProductListingState} from './mock-product-listing-state';
import {buildMockProductRecommendationsState} from './mock-product-recommendations-state';
import {createMockRecommendationState} from './mock-recommendation-state';
import {buildMockSearchAPIClient} from './mock-search-api-client';
import {createMockState} from './mock-state';

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

export interface MockSSRSearchEngine extends MockSearchEngine {
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

/**
 * For internal use only.
 *
 * Returns a non-functional `SSRSearchEngine`.
 * To be used only for unit testing SSR controllers, not for functional tests.
 */
export function buildMockSSRSearchEngine(): MockSSRSearchEngine {
  const engine = buildMockSearchAppEngine();
  return {
    ...engine,
    waitForSearchCompletedAction: jest.fn(),
  };
}

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
 * @deprecated
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
 * @deprecated
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
 * @deprecated
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
    get relay(): Relay {
      return null as unknown as Relay;
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
    store: configureStore<AppState, DispatchExts>([
      instantlyCallableThunkActionMiddleware,
      logActionErrorMiddleware(logger),
      analyticsMiddleware,
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
    store: configureStore<AppState, DispatchExts>([
      instantlyCallableThunkActionMiddleware,
      logActionErrorMiddleware(logger),
      analyticsMiddleware,
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
