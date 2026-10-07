import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {Turn} from '@coveo/thermidor';
import type {TargetedProduct} from '../context/targeting.js';
import {COMMERCE_SEARCH_ROOT_TYPE, latestCommerceSurfaceId} from '../a2ui/surface-messages.js';

type ViewState = 'landing' | 'search' | 'conversation';

type NavAction =
  | {type: 'NAVIGATE_SEARCH'}
  | {type: 'NAVIGATE_CONVERSATION'}
  | {type: 'NAVIGATE_LANDING'};

interface NavState {
  view: ViewState;
}

interface ConverseState {
  turns: Turn[];
  isStreaming: boolean;
}

interface Controller {
  submitPrompt(prompt: string): void;
  clear(): void;
}

export interface Navigation {
  view: ViewState;
  commerceSurfaceId: string | null;
  persistedQuery: string;
  canGoBackToSearch: boolean;
  targetedProducts: TargetedProduct[];
  setTargetedProducts: (products: TargetedProduct[]) => void;
  handleSubmit: (prompt: string) => void;
  handleBackToSearch: () => void;
  handleBackToConversation: () => void;
  handleResetToLanding: () => void;
}

function navReducer(state: NavState, action: NavAction): NavState {
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

/** The turn and commerce-search surface the navigation last acted on. */
interface ObservedTurn {
  turnId: string;
  commerceSurfaceId: string | null;
}

export function deriveTransitionAction(turn: Turn): NavAction | null {
  if (turn.status !== 'complete') return null;

  const surfaces = turn.response.surfaces;
  const hasSurface = surfaces.length > 0;

  // A commerce-search root navigates to the dedicated results page.
  if (surfaces.some((s) => s.rootComponentType === COMMERCE_SEARCH_ROOT_TYPE))
    return {type: 'NAVIGATE_SEARCH'};

  // Any other root componentType renders inline in the conversation flow.
  if (hasSurface) return {type: 'NAVIGATE_CONVERSATION'};

  // A plain-text response also routes to the conversation.
  return {type: 'NAVIGATE_CONVERSATION'};
}

export function useNavigation(controller: Controller, converseState: ConverseState): Navigation {
  const [{view}, dispatch] = useReducer(navReducer, {view: 'landing'});

  const commerceSurfaceIdRef = useRef<string | null>(null);
  const persistedQueryRef = useRef<string>('');
  const lastObservedRef = useRef<ObservedTurn | null>(null);
  const pendingNavigationRef = useRef(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);
  const [targetedProducts, setTargetedProducts] = useState<TargetedProduct[]>([]);

  const persistAndNavigateToSearch = useCallback(
    (turn: Turn, query: string = turn.input.prompt ?? '') => {
      const surfaceId = latestCommerceSurfaceId(turn.response.surfaces);
      commerceSurfaceIdRef.current = surfaceId;
      persistedQueryRef.current = query;
      lastObservedRef.current = {turnId: turn.id, commerceSurfaceId: surfaceId};

      setCanGoBackToSearch(true);

      dispatch({type: 'NAVIGATE_SEARCH'});
    },
    [dispatch]
  );

  useEffect(() => {
    const turns = converseState.turns;

    if (pendingNavigationRef.current && turns.length > 0) {
      const latestTurn = turns[turns.length - 1];

      const surfaceId = latestCommerceSurfaceId(latestTurn.response.surfaces);
      if (surfaceId) {
        pendingNavigationRef.current = false;
        persistAndNavigateToSearch(latestTurn);
        return;
      }

      if ((latestTurn.response.agent?.reasoningSteps.length ?? 0) > 0) {
        pendingNavigationRef.current = false;
        dispatch({type: 'NAVIGATE_CONVERSATION'});
      }
    }

    let latestCompletedTurn = null;
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].status === 'complete') {
        latestCompletedTurn = turns[i];
        break;
      }
    }

    if (!latestCompletedTurn) return;

    const commerceSurfaceId = latestCommerceSurfaceId(latestCompletedTurn.response.surfaces);
    const lastObserved = lastObservedRef.current;
    if (latestCompletedTurn.id === lastObserved?.turnId) {
      // An already observed turn moves the view only when it gains a new search block: a search
      // option tapped in an agent answer opens one on the same turn. Its query is not sent to the
      // browser, so the prompt input starts empty.
      if (commerceSurfaceId && commerceSurfaceId !== lastObserved.commerceSurfaceId) {
        persistAndNavigateToSearch(latestCompletedTurn, '');
      }
      return;
    }

    lastObservedRef.current = {turnId: latestCompletedTurn.id, commerceSurfaceId};

    const action = deriveTransitionAction(latestCompletedTurn);

    if (action?.type === 'NAVIGATE_SEARCH') {
      persistAndNavigateToSearch(latestCompletedTurn);
    } else if (action?.type === 'NAVIGATE_CONVERSATION') {
      if (pendingNavigationRef.current) {
        pendingNavigationRef.current = false;
        dispatch(action);
      }
    }
  }, [converseState.turns, dispatch, persistAndNavigateToSearch]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || converseState.isStreaming) return;
      controller.submitPrompt(prompt);
      if (view === 'landing' || view === 'search') {
        pendingNavigationRef.current = true;
      }
    },
    [controller, converseState.isStreaming, view]
  );

  const handleBackToSearch = useCallback(() => {
    if (commerceSurfaceIdRef.current) {
      persistedQueryRef.current = '';
      dispatch({type: 'NAVIGATE_SEARCH'});
    }
  }, []);

  const handleBackToConversation = useCallback(() => {
    dispatch({type: 'NAVIGATE_CONVERSATION'});
  }, []);

  const handleResetToLanding = useCallback(() => {
    commerceSurfaceIdRef.current = null;
    setCanGoBackToSearch(false);
    setTargetedProducts([]);
    controller.clear();
    dispatch({type: 'NAVIGATE_LANDING'});
  }, [controller]);

  return {
    view,
    commerceSurfaceId: commerceSurfaceIdRef.current,
    persistedQuery: persistedQueryRef.current,
    canGoBackToSearch,
    targetedProducts,
    setTargetedProducts,
    handleSubmit,
    handleBackToSearch,
    handleBackToConversation,
    handleResetToLanding,
  };
}
