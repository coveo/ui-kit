import {useReducer} from 'react';
import type {Turn} from '@coveo/thermidor';

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

/**
 * Given a completed turn, derives the navigation action to dispatch.
 * Returns null if no transition should occur (e.g., error turns).
 */
export function deriveTransitionAction(turn: Turn): AppAction | null {
  if (turn.status !== 'complete') {
    return null;
  }

  if (turn.routedInterface) {
    return {type: 'NAVIGATE_SEARCH'};
  }

  if (turn.agentResponse) {
    return {type: 'NAVIGATE_CONVERSATION'};
  }

  return null;
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, {view: 'landing'});
  return {view: state.view, dispatch};
}
