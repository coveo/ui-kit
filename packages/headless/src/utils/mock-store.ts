import createMockStore from 'redux-mock-store';
import {AnyAction, ThunkDispatch, getDefaultMiddleware} from '@reduxjs/toolkit';
import {HeadlessState} from '../state';

type DispatchExts = ThunkDispatch<HeadlessState, void, AnyAction>;
export const mockStore = createMockStore<HeadlessState, DispatchExts>(
  getDefaultMiddleware()
);
