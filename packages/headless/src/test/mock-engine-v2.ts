import type {Relay} from '@coveo/relay';
import {type Logger, pino} from 'pino';
import {type Mock, vi} from 'vitest';
import type {CaseAssistEngine} from '../app/case-assist-engine/case-assist-engine.js';
import type {CommerceEngine} from '../app/commerce-engine/commerce-engine.js';
import type {CoreEngine, CoreEngineNext} from '../app/engine.js';
import type {InsightEngine} from '../app/insight-engine/insight-engine.js';
import {defaultNodeJSNavigatorContextProvider} from '../app/navigator-context-provider.js';
import type {RecommendationEngine} from '../app/recommendation-engine/recommendation-engine.js';
import type {SearchEngine} from '../app/search-engine/search-engine.js';
import {stateKey} from '../app/state-key.js';
import type {SSRCommerceEngine} from '../ssr/commerce/factories/build-factory.js';
import type {SSRSearchEngine} from '../ssr/search/engine/search-engine.ssr.js';

type SpyEverything<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R>
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
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  });
}

type MockedRelay = Relay & Pick<Relay, 'emit'>;

function mockRelay(): MockedRelay {
  return {
    emit: vi.fn(),
    getMeta: vi.fn().mockReturnValue({clientId: 'test'}),
    off: vi.fn(),
    on: vi.fn(),
    updateConfig: vi.fn(),
    version: 'test',
  };
}

type MockedCoreEngine<
  State extends StateFromEngine<CoreEngine> = StateFromEngine<CoreEngine>,
> = CoreEngine & {
  state: State;
  logger: MockedLogger;
  relay: MockedRelay;
} & SpyEverything<Omit<CoreEngine, 'logger' | 'state' | 'relay'>>;

function buildMockCoreEngine<State extends StateFromEngine<CoreEngine>>(
  initialState: State
): MockedCoreEngine<State> {
  const state: State = initialState;
  return {
    state,
    // @ts-expect-error testing purposes
    dispatch: vi.fn(),
    addReducers: vi.fn(),
    disableAnalytics: vi.fn(),
    enableAnalytics: vi.fn(),
    logger: mockLogger(pino({level: 'silent'})),
    relay: mockRelay(),
    store: {
      // @ts-expect-error testing purposes
      dispatch: vi.fn(),
      getState: vi.fn(),
      replaceReducer: vi.fn(),
      subscribe: vi.fn(),
      [Symbol.observable]: vi.fn(),
    },
    subscribe: vi.fn(),
    navigatorContext: defaultNodeJSNavigatorContextProvider(),
  };
}

type MockedCoreEngineNext<
  State extends
    StateFromEngineNext<CoreEngineNext> = StateFromEngineNext<CoreEngineNext>,
> = CoreEngineNext & {
  [stateKey]: State;
  logger: MockedLogger;
  relay: MockedRelay;
} & SpyEverything<Omit<CoreEngineNext, 'logger' | 'stateKey' | 'relay'>>;

function buildMockCoreEngineNext<
  State extends StateFromEngineNext<CoreEngineNext>,
>(initialState: State): MockedCoreEngineNext<State> {
  const state: State = initialState;
  return {
    [stateKey]: state,
    configuration: state.configuration,
    // @ts-expect-error testing purposes
    dispatch: vi.fn(),
    addReducers: vi.fn(),
    disableAnalytics: vi.fn(),
    enableAnalytics: vi.fn(),
    logger: mockLogger(pino({level: 'silent'})),
    relay: mockRelay(),
    subscribe: vi.fn(),
    navigatorContext: defaultNodeJSNavigatorContextProvider(),
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
export type MockedCommerceEngine = CommerceEngine;
export type MockedInsightEngine = InsightEngine;

type StateFromEngine<TEngine extends CoreEngine> = TEngine['state'];

type StateFromEngineNext<TEngine extends CoreEngineNext> =
  TEngine[typeof stateKey];

export function buildMockSearchEngine(
  initialState: StateFromEngine<SearchEngine>
): MockedSearchEngine {
  return {
    ...buildMockCoreEngine(initialState),
    executeFirstSearch: vi.fn(),
    executeFirstSearchAfterStandaloneSearchBoxRedirect: vi.fn(),
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
  State extends StateFromEngineNext<CommerceEngine>,
>(initialState: State): CommerceEngine {
  return {
    ...buildMockCoreEngineNext(initialState),
    configuration: {
      ...initialState.configuration,
    },
  };
}

export function buildMockInsightEngine<
  State extends StateFromEngine<InsightEngine>,
>(initialState: State): InsightEngine {
  return {
    ...buildMockCoreEngine(initialState),
    executeFirstSearch: vi.fn(),
  };
}

export function buildMockRecommendationEngine<
  State extends StateFromEngine<RecommendationEngine>,
>(initialState: State): RecommendationEngine {
  return {
    ...buildMockCoreEngine(initialState),
  };
}

export function buildMockSSRSearchEngine(
  initialState: StateFromEngine<SearchEngine>
): SSRSearchEngine {
  const engine = buildMockSearchEngine(initialState);
  return {
    ...engine,
    waitForSearchCompletedAction: vi.fn(),
  };
}

export function buildMockSSRCommerceEngine(
  initialState: StateFromEngineNext<CommerceEngine>
): SSRCommerceEngine {
  const engine = buildMockCommerceEngine(initialState);
  return {
    ...engine,
    waitForRequestCompletedAction: vi.fn(),
  };
}
