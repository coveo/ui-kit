import {Engine} from '../app/headless-engine';
import {createMockState} from './mock-state';
import configureStore, {MockStoreEnhanced} from 'redux-mock-store';
import {AnyAction, ThunkDispatch, getDefaultMiddleware} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import {analyticsMiddleware} from '../app/analytics-middleware';
import {SearchAPIClient} from '../api/search/search-api-client';
import {SearchAppState} from '../state/search-app-state';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {createMockRecommendationState} from './mock-recommendation-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {buildMockProductRecommendationsState} from './mock-product-recommendations-state';

export type AppState =
  | SearchAppState
  | RecommendationAppState
  | ProductRecommendationsAppState;

export interface MockEngine<T extends AppState> extends Engine<T> {
  mockStore: MockStore;
  actions: AnyAction[];
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
  const storeConfiguration = configureMockStore();
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
    ...config,
    renewAccessToken: mockRenewAccessToken,
  };
}

const configureMockStore = () => {
  return configureStore<AppState, DispatchExts>([
    analyticsMiddleware,
    thunk.withExtraArgument({
      searchAPIClient: new SearchAPIClient(mockRenewAccessToken),
    }),
    ...getDefaultMiddleware(),
  ]);
};
