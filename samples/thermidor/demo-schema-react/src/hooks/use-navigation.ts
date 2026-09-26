import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import type {TargetedProduct} from '../context/targeting.js';

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
  submit(options: {prompt: string}): void;
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

const COMMERCE_SEARCH_ROOT_TYPE = 'CommerceSearch';

/**
 * Reads the typed `response.surfaces` projection to find the turn's
 * commerce-search surface, returning its `surfaceId` or null. Surface discovery
 * is done by the client fold; consumers never walk `response.activities`.
 */
function findCommerceSurfaceId(surfaces: DiscoveredSurface[] | undefined): string | null {
  const surface = surfaces?.find((s) => s.rootComponentType === COMMERCE_SEARCH_ROOT_TYPE);
  return surface?.surfaceId ?? null;
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
  const lastObservedTurnIdRef = useRef<string | null>(null);
  const pendingNavigationRef = useRef(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);
  const [targetedProducts, setTargetedProducts] = useState<TargetedProduct[]>([]);

  const persistAndNavigateToSearch = useCallback(
    (turn: Turn) => {
      const surfaceId = findCommerceSurfaceId(turn.response.surfaces);
      commerceSurfaceIdRef.current = surfaceId;
      persistedQueryRef.current = turn.input.prompt ?? '';
      lastObservedTurnIdRef.current = turn.id;

      setCanGoBackToSearch(true);

      dispatch({type: 'NAVIGATE_SEARCH'});
    },
    [dispatch]
  );

  useEffect(() => {
    const turns = converseState.turns;

    if (pendingNavigationRef.current && turns.length > 0) {
      const latestTurn = turns[turns.length - 1];

      const surfaceId = findCommerceSurfaceId(latestTurn.response.surfaces);
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
    if (latestCompletedTurn.id === lastObservedTurnIdRef.current) return;

    lastObservedTurnIdRef.current = latestCompletedTurn.id;

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
      controller.submit({prompt});
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
