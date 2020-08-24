import {Engine} from '../app/headless-engine';
import {createMockState} from './mock-state';
import configureStore, {MockStoreEnhanced} from 'redux-mock-store';
import {AnyAction, ThunkDispatch, getDefaultMiddleware} from '@reduxjs/toolkit';
import {SearchPageState} from '../state';
import thunk from 'redux-thunk';
import {analyticsMiddleware} from '../app/analytics-middleware';
import {SearchAPIClient} from '../api/search/search-api-client';

export interface MockEngine extends Engine {
  store: MockStore;
  actions: AnyAction[];
}

const mockRenewAccessToken = async () => '';

export function buildMockEngine(config: Partial<Engine> = {}): MockEngine {
  const storeConfiguration = configureMockStore();
  const store = storeConfiguration(config.state || createMockState());
  const unsubscribe = () => {};

  return {
    store: store,
    state: createMockState(),
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

type DispatchExts = ThunkDispatch<SearchPageState, void, AnyAction>;
const configureMockStore = () => {
  return configureStore<SearchPageState, DispatchExts>([
    analyticsMiddleware,
    thunk.withExtraArgument({
      searchAPIClient: new SearchAPIClient(mockRenewAccessToken),
    }),
    ...getDefaultMiddleware(),
  ]);
};
type MockStore = MockStoreEnhanced<SearchPageState, DispatchExts>;
