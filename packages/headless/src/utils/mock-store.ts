import createReduxMockStore from 'redux-mock-store';
import {AnyAction, ThunkDispatch, getDefaultMiddleware} from '@reduxjs/toolkit';
import {HeadlessState} from '../state';

type DispatchExts = ThunkDispatch<HeadlessState, void, AnyAction>;
export const createMockStore = createReduxMockStore<
  HeadlessState,
  DispatchExts
>(getDefaultMiddleware());
export type MockStore = ReturnType<typeof createMockStore>;
