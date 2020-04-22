import {
  configureStore as configureStoreToolkit,
  getDefaultMiddleware,
  ThunkAction,
  Action,
} from '@reduxjs/toolkit';
import {rootReducer, RootState} from './rootReducer';

export function configureStore(preloadedState?: RootState) {
  const store = configureStoreToolkit({
    reducer: rootReducer,
    preloadedState,
    middleware: [...getDefaultMiddleware()],
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () => {
      store.replaceReducer(require('./rootReducer').rootReducer);
    });
  }

  return store;
}

export type AppThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
