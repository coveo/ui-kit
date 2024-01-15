import pino, {Logger} from 'pino';
import type {CoreEngine} from '../app/engine';
import type {CaseAssistEngine} from '../case-assist.index';
import type {CommerceEngine} from '../commerce.index';
import type {SearchEngine} from '../index';
import type {InsightEngine} from '../insight.index';
import type {ProductListingEngine} from '../product-listing.index';
import type {ProductRecommendationEngine} from '../product-recommendation.index';
import type {RecommendationEngine} from '../recommendation.index';

type SpyEverything<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.Mock<R, A>
    : T[K] extends object
      ? SpyEverything<T[K]>
      : T[K];
};

type SpiedLoggerProps = SpyEverything<
  Pick<Logger, 'debug' | 'info' | 'warn' | 'error' | 'fatal'>
>;

type MockedLogger = Logger & SpiedLoggerProps;

function mockLogger(logger: Logger): MockedLogger {
  return Object.assign<Logger, SpiedLoggerProps>(logger, {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  });
}

type MockedCoreEngine<
  State extends StateFromEngine<CoreEngine> = StateFromEngine<CoreEngine>,
> = CoreEngine & {
  state: State;
  logger: MockedLogger;
} & SpyEverything<Omit<CoreEngine, 'logger' | 'state'>>;

export function buildMockCoreEngine<State extends StateFromEngine<CoreEngine>>(
  initialState: State
): MockedCoreEngine<State> {
  const state: State = initialState;
  return {
    state,
    dispatch: jest.fn(),
    addReducers: jest.fn(),
    disableAnalytics: jest.fn(),
    enableAnalytics: jest.fn(),
    logger: mockLogger(pino({level: 'silent'})),
    store: {
      dispatch: jest.fn(),
      getState: jest.fn(),
      replaceReducer: jest.fn(),
      subscribe: jest.fn(),
      [Symbol.observable]: jest.fn(),
    },
    subscribe: jest.fn(),
  };
}

export type MockedSearchEngine = SearchEngine &
  MockedCoreEngine<StateFromEngine<SearchEngine>> &
  SpyEverything<
    Pick<
      SearchEngine,
      | 'executeFirstSearch'
      | 'executeFirstSearchAfterStandaloneSearchBoxRedirect'
    >
  >;

export type MockedCaseAssistEngine = CaseAssistEngine;
export type MockedRecommendationEngine = RecommendationEngine;
export type MockedProductRecommendationEngine = ProductRecommendationEngine;

type StateFromEngine<TEngine extends CoreEngine> = TEngine['state'];

export function buildMockSearchEngine(
  initialState: StateFromEngine<SearchEngine>
): MockedSearchEngine {
  return {
    ...buildMockCoreEngine(initialState),
    executeFirstSearch: jest.fn(),
    executeFirstSearchAfterStandaloneSearchBoxRedirect: jest.fn(),
  };
}

export function buildMockCaseAssistEngine<
  State extends StateFromEngine<CaseAssistEngine>,
>(initialState: State): CaseAssistEngine {
  return {
    ...buildMockCoreEngine<State>(initialState),
  };
}

export function buildMockCommerceEngine<
  State extends StateFromEngine<CommerceEngine>,
>(initialState: State): CommerceEngine {
  return {
    ...buildMockCoreEngine(initialState),
  };
}

export function buildMockInsightEngine<
  State extends StateFromEngine<InsightEngine>,
>(initialState: State): InsightEngine {
  return {
    ...buildMockCoreEngine(initialState),
    executeFirstSearch: jest.fn(),
  };
}
export function buildMockProductListingEngine<
  State extends StateFromEngine<ProductListingEngine>,
>(initialState: State): ProductListingEngine {
  return {
    ...buildMockCoreEngine(initialState),
  };
}

export function buildMockProductRecommendationEngine<
  State extends StateFromEngine<ProductRecommendationEngine>,
>(initialState: State): ProductRecommendationEngine {
  return {
    ...buildMockCoreEngine(initialState),
  };
}

export function buildMockRecommendationEngine<
  State extends StateFromEngine<RecommendationEngine>,
>(initialState: State): RecommendationEngine {
  return {
    ...buildMockCoreEngine(initialState),
  };
}
