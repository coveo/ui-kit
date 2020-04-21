import {
  configureStore as configureStoreTool,
  getDefaultMiddleware,
  ThunkAction,
  Action,
} from '@reduxjs/toolkit';
import {rootReducer, RootState} from './rootReducer';

export function configureStore(preloadedState?: RootState) {
  const store = configureStoreTool({
    reducer: rootReducer,
    preloadedState,
    middleware: [...getDefaultMiddleware()],
  });

  return store;
}

export type AppThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
