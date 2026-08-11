import {useCallback, useEffect, useRef, useState} from 'react';
import {buildUnifiedConverseController, type RoutedInterface, type Turn} from '@coveo/thermidor';
import {useGenerativeInterface} from '../context/generative-interface.js';
import {useBuildController} from '../hooks/use-build-controller.js';
import {useAppState, deriveTransitionAction} from '../hooks/use-app-state.js';
import type {TargetedProduct} from '../context/targeting.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage/index.js';

export function AppShell() {
  const generativeInterface = useGenerativeInterface();
  const [controller, converseState] = useBuildController(() =>
    buildUnifiedConverseController({interface: generativeInterface})
  );

  const {view, dispatch} = useAppState();

  const persistedInterfaceRef = useRef<RoutedInterface | null>(null);
  const persistedInterfaceTurnIdRef = useRef<string | null>(null);
  const persistedQueryRef = useRef<string>('');
  const lastObservedTurnIdRef = useRef<string | null>(null);
  const pendingNavigationRef = useRef(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);
  const [targetedProducts, setTargetedProducts] = useState<TargetedProduct[]>([]);

  const persistAndNavigateToSearch = useCallback(
    (turn: Turn) => {
      if (persistedInterfaceRef.current) {
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
      persistedInterfaceRef.current?.interface.dispose();
    };
  }, []);

  useEffect(() => {
    const turns = converseState.turns;

    // NAVIGATION ORDERING INVARIANT: When pendingNavigationRef is true,
    // we check routedInterface BEFORE agentResponse.reasoningSteps.
    // This ensures that if a turn produces a routed interface, we navigate to
    // search regardless of whether reasoning steps also appeared. The routedInterface
    // check uses an early return to guarantee mutual exclusivity.
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

  const handleSubmit = (prompt: string) => {
    if (!prompt.trim() || converseState.isStreaming) return;
    controller.submit({prompt});
    if (view === 'landing' || view === 'search') {
      pendingNavigationRef.current = true;
    }
  };

  const handleBackToSearch = () => {
    if (persistedInterfaceRef.current) {
      persistedQueryRef.current = '';
      dispatch({type: 'NAVIGATE_SEARCH'});
    }
  };

  const handleBackToConversation = () => {
    dispatch({type: 'NAVIGATE_CONVERSATION'});
  };

  const handleResetToLanding = () => {
    if (persistedInterfaceRef.current) {
      persistedInterfaceRef.current.interface.dispose();
      persistedInterfaceRef.current = null;
      persistedInterfaceTurnIdRef.current = null;
      setCanGoBackToSearch(false);
    }
    setTargetedProducts([]);
    controller.clear();
    dispatch({type: 'NAVIGATE_LANDING'});
  };

  return (
    <div className="view-shell">
      {persistedInterfaceRef.current && (
        <div className={`view-panel ${view === 'search' ? 'view-panel--active' : ''}`}>
          <SearchResultsPage
            key={persistedInterfaceTurnIdRef.current!}
            onSubmit={handleSubmit}
            isStreaming={converseState.isStreaming}
            routedInterface={persistedInterfaceRef.current}
            query={persistedQueryRef.current}
            onBackToConversation={handleBackToConversation}
            products={targetedProducts}
            onProductsChange={setTargetedProducts}
          />
        </div>
      )}
      {view !== 'search' && (
        <div className="view-panel view-panel--active">
          {view === 'conversation' ? (
            <ConversationPage
              onSubmit={handleSubmit}
              isStreaming={converseState.isStreaming}
              turns={converseState.turns}
              onBackToSearch={handleBackToSearch}
              canGoBackToSearch={canGoBackToSearch}
              products={targetedProducts}
              onProductsChange={setTargetedProducts}
            />
          ) : (
            <LandingPage onSubmit={handleSubmit} isStreaming={converseState.isStreaming} />
          )}
        </div>
      )}
    </div>
  );
}
