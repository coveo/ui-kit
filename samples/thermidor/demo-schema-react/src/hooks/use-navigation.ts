import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {Turn, Activity} from '@coveo/thermidor';
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

export interface DerivedSurface {
  surfaceType: string;
  surfaceId: string;
}

/**
 * Scans a turn's activities for the first A2-UI createSurface message and
 * returns its surfaceType and surfaceId. Returns null when no such surface
 * exists (e.g. a plain-text conversational response).
 */
export function findSurface(activities: Activity[] | undefined): DerivedSurface | null {
  if (!activities) return null;

  for (const activity of activities) {
    if (activity.kind !== 'a2ui-surface') continue;

    const messages = activity.payload['messages'];
    if (!Array.isArray(messages)) continue;

    for (const msg of messages) {
      if (
        msg &&
        typeof msg === 'object' &&
        'createSurface' in msg &&
        msg.createSurface &&
        typeof msg.createSurface === 'object' &&
        'surfaceType' in msg.createSurface &&
        typeof msg.createSurface.surfaceType === 'string' &&
        'surfaceId' in msg.createSurface &&
        typeof msg.createSurface.surfaceId === 'string'
      ) {
        return {
          surfaceType: msg.createSurface.surfaceType,
          surfaceId: msg.createSurface.surfaceId,
        };
      }
    }
  }

  return null;
}

/**
 * Returns the surfaceId of a turn's commerce-search surface, or null.
 */
export function findCommerceSurfaceId(activities: Activity[] | undefined): string | null {
  const surface = findSurface(activities);
  return surface?.surfaceType === 'commerceSearch' ? surface.surfaceId : null;
}

function deriveTransitionAction(turn: Turn): NavAction | null {
  if (turn.status !== 'complete') return null;

  const surface = findSurface(turn.agentResponse?.activities);

  // Commerce-search surfaces navigate to the dedicated results page.
  if (surface?.surfaceType === 'commerceSearch') return {type: 'NAVIGATE_SEARCH'};

  // Converse surfaces render inline in the conversation flow.
  if (surface?.surfaceType === 'converse') return {type: 'NAVIGATE_CONVERSATION'};

  // A plain-text response without any surface also routes to the conversation.
  if (!surface && turn.agentResponse) return {type: 'NAVIGATE_CONVERSATION'};

  // Any other (unknown) surfaceType is intentionally not routed: the consumer
  // must add an explicit branch rather than fall back to a default view.
  return null;
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
      const surfaceId = findCommerceSurfaceId(turn.agentResponse?.activities);
      commerceSurfaceIdRef.current = surfaceId;
      persistedQueryRef.current = turn.prompt;
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

      const surfaceId = findCommerceSurfaceId(latestTurn.agentResponse?.activities);
      if (surfaceId) {
        pendingNavigationRef.current = false;
        persistAndNavigateToSearch(latestTurn);
        return;
      }

      if (latestTurn.agentResponse && latestTurn.agentResponse.reasoningSteps?.length > 0) {
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
