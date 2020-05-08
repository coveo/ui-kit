import {
  configureStore as configureStoreToolkit,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import {rootReducer} from './root-reducer';
import {HeadlessState} from '../state';

export function configureStore(preloadedState?: HeadlessState) {
  const store = configureStoreToolkit({
    reducer: rootReducer,
    preloadedState,
    middleware: [...getDefaultMiddleware()],
  });

  return store;
}
