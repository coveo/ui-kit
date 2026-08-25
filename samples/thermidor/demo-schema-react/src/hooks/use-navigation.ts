import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {RoutedInterface, Turn} from '@coveo/thermidor';
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
  persistedInterface: RoutedInterface | null;
  persistedTurnId: string | null;
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

function deriveTransitionAction(turn: Turn): NavAction | null {
  if (turn.status !== 'complete') return null;
  if (turn.routedInterface) return {type: 'NAVIGATE_SEARCH'};
  if (turn.agentResponse) return {type: 'NAVIGATE_CONVERSATION'};
  return null;
}

export function useNavigation(controller: Controller, converseState: ConverseState): Navigation {
  const [{view}, dispatch] = useReducer(navReducer, {view: 'landing'});

  const persistedInterfaceRef = useRef<RoutedInterface | null>(null);
  const persistedInterfaceTurnIdRef = useRef<string | null>(null);
  const persistedQueryRef = useRef<string>('');
  const lastObservedTurnIdRef = useRef<string | null>(null);
  const pendingNavigationRef = useRef(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);
  const [targetedProducts, setTargetedProducts] = useState<TargetedProduct[]>([]);

  const persistAndNavigateToSearch = useCallback(
    (turn: Turn) => {
      if (persistedInterfaceRef.current && 'interface' in persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
      persistedInterfaceRef.current = turn.routedInterface!;
      persistedInterfaceTurnIdRef.current = turn.id;
      persistedQueryRef.current = turn.prompt;
      lastObservedTurnIdRef.current = turn.id;

      setCanGoBackToSearch(true);

      dispatch({type: 'NAVIGATE_SEARCH'});
    },
    [dispatch]
  );

  useEffect(() => {
    return () => {
      if (persistedInterfaceRef.current && 'interface' in persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const turns = converseState.turns;

    // NAVIGATION ORDERING INVARIANT: When pendingNavigationRef is true,
    // we check routedInterface BEFORE agentResponse.reasoningSteps.
    // This ensures that if a turn produces a routed interface, we navigate to
    // search regardless of whether reasoning steps also appeared.
    if (pendingNavigationRef.current && turns.length > 0) {
      const latestTurn = turns[turns.length - 1];

      if (latestTurn.routedInterface) {
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

    if (action?.type === 'NAVIGATE_SEARCH' && latestCompletedTurn.routedInterface) {
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
    if (persistedInterfaceRef.current) {
      persistedQueryRef.current = '';
      dispatch({type: 'NAVIGATE_SEARCH'});
    }
  }, []);

  const handleBackToConversation = useCallback(() => {
    dispatch({type: 'NAVIGATE_CONVERSATION'});
  }, []);

  const handleResetToLanding = useCallback(() => {
    if (persistedInterfaceRef.current) {
      if ('interface' in persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
      persistedInterfaceRef.current = null;
      persistedInterfaceTurnIdRef.current = null;
      setCanGoBackToSearch(false);
    }

    setTargetedProducts([]);

    controller.clear();

    dispatch({type: 'NAVIGATE_LANDING'});
  }, [controller]);

  return {
    view,
    persistedInterface: persistedInterfaceRef.current,
    persistedTurnId: persistedInterfaceTurnIdRef.current,
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
