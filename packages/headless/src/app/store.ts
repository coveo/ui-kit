import {createStore, applyMiddleware, Action} from 'redux';
import thunkMiddleware, {ThunkAction} from 'redux-thunk';
import {rootReducer, RootState} from './rootReducer';
import {devMiddlewares} from './devMiddlewares';
import {composeWithDevTools} from 'redux-devtools-extension';

export function configureStore() {
  const middlewares = [...devMiddlewares, thunkMiddleware];
  const middleWareEnhancer = applyMiddleware(...middlewares);
  return createStore(rootReducer, composeWithDevTools(middleWareEnhancer));
}

export type AppThunk<
  ActionType extends Action<string>,
  ReturnType = void
> = ThunkAction<ReturnType, RootState, unknown, ActionType>;
