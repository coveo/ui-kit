import {useReducer} from 'react';

export type ViewState = 'landing' | 'search' | 'conversation';

export type AppAction =
  | {type: 'NAVIGATE_SEARCH'}
  | {type: 'NAVIGATE_CONVERSATION'}
  | {type: 'NAVIGATE_LANDING'};

export interface AppState {
  view: ViewState;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE_SEARCH':
      return {view: 'search'};
    case 'NAVIGATE_CONVERSATION':
      return {view: 'conversation'};
    case 'NAVIGATE_LANDING':
      return {view: 'landing'};
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, {view: 'landing'});
  return {view: state.view, dispatch};
}
