import {Engine} from '../app/headless-engine';
import {createMockState} from './mock-state';
import createReduxMockStore from 'redux-mock-store';
import {AnyAction, ThunkDispatch, getDefaultMiddleware} from '@reduxjs/toolkit';
import {HeadlessState} from '../state';

export interface MockEngine extends Engine {
  store: MockStore;
  actions: AnyAction[];
}

export function buildMockEngine(config: Partial<Engine>): MockEngine {
  const store = createMockStore();

  return {
    store,
    state: createMockState(),
    subscribe: jest.fn(),
    get dispatch() {
      return store.dispatch;
    },
    get actions() {
      return store.getActions();
    },
    ...config,
  };
}

type DispatchExts = ThunkDispatch<HeadlessState, void, AnyAction>;
const createMockStore = createReduxMockStore<HeadlessState, DispatchExts>(
  getDefaultMiddleware()
);

type MockStore = ReturnType<typeof createMockStore>;
