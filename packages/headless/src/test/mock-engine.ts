import {Engine} from '../app/headless-engine';
import {createMockState} from './mock-state';
import configureStore, {MockStoreEnhanced} from 'redux-mock-store';
import {
  AnyAction,
  ThunkDispatch,
  getDefaultMiddleware,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import {analyticsMiddleware} from '../app/analytics-middleware';
import {SearchAPIClient} from '../api/search/search-api-client';
import {SearchAppState} from '../state/search-app-state';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {createMockRecommendationState} from './mock-recommendation-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {buildMockProductRecommendationsState} from './mock-product-recommendations-state';
import {NoopPreprocessRequestMiddleware} from '../api/platform-client';
import pino, {Logger} from 'pino';

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
  mockStore: MockStore;
  actions: AnyAction[];
  findAsyncAction: <ThunkArg>(
    action: AsyncActionCreator<ThunkArg>
  ) => ReturnType<AsyncActionCreator<ThunkArg>> | undefined;
}

type MockStore = MockStoreEnhanced<AppState, DispatchExts>;
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
    mockStore: store,
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
    ...config,
    renewAccessToken: mockRenewAccessToken,
    logger,
  };
}

const configureMockStore = (logger: Logger) => {
  return configureStore<AppState, DispatchExts>([
    analyticsMiddleware,
    thunk.withExtraArgument({
      searchAPIClient: new SearchAPIClient({
        logger,
        renewAccessToken: mockRenewAccessToken,
        preprocessRequest: NoopPreprocessRequestMiddleware,
      }),
    }),
    ...getDefaultMiddleware(),
  ]);
};

function isAsyncAction<ThunkArg>(
  action: AnyAction | undefined
): action is ReturnType<AsyncActionCreator<ThunkArg>> {
  return action ? 'meta' in action : false;
}