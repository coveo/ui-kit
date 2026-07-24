import {useEffect, useRef, useState} from 'react';
import {buildConverseController, type RoutedInterface} from '@coveo/thermidor';
import {useGenerativeInterface} from '../context/generative-interface.js';
import {useBuildController} from '../hooks/use-build-controller.js';
import {useAppState, deriveTransitionAction} from '../hooks/use-app-state.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage/index.js';

export function AppShell() {
  const generativeInterface = useGenerativeInterface();
  const [controller, converseState] = useBuildController(() =>
    buildConverseController({interface: generativeInterface})
  );

  const {view, dispatch} = useAppState();

  const persistedInterfaceRef = useRef<RoutedInterface | null>(null);
  const persistedInterfaceTurnIdRef = useRef<string | null>(null);
  const persistedQueryRef = useRef<string>('');
  const lastObservedTurnIdRef = useRef<string | null>(null);
  const pendingLandingNavigationRef = useRef(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);

  useEffect(() => {
    return () => {
      persistedInterfaceRef.current?.interface.dispose();
    };
  }, []);

  useEffect(() => {
    const turns = converseState.turns;

    // NAVIGATION ORDERING INVARIANT: When pendingLandingNavigationRef is true,
    // we check routedInterface BEFORE agentResponse.reasoningSteps.
    // This ensures that if a turn produces a routed interface, we navigate to
    // search regardless of whether reasoning steps also appeared. The routedInterface
    // check uses an early return to guarantee mutual exclusivity.
    if (pendingLandingNavigationRef.current && turns.length > 0) {
      const latestTurn = turns[turns.length - 1];

      if (latestTurn.routedInterface) {
        pendingLandingNavigationRef.current = false;
        if (persistedInterfaceRef.current) {
          persistedInterfaceRef.current.interface.dispose();
        }
        persistedInterfaceRef.current = latestTurn.routedInterface;
        persistedInterfaceTurnIdRef.current = latestTurn.id;
        persistedQueryRef.current = latestTurn.prompt;
        lastObservedTurnIdRef.current = latestTurn.id;
        setCanGoBackToSearch(true);
        dispatch({type: 'NAVIGATE_SEARCH'});
        return;
      }

      if (
        latestTurn.agentResponse &&
        latestTurn.agentResponse.reasoningSteps?.length > 0
      ) {
        pendingLandingNavigationRef.current = false;
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
      if (persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
      persistedInterfaceRef.current = latestCompletedTurn.routedInterface;
      persistedInterfaceTurnIdRef.current = latestCompletedTurn.id;
      persistedQueryRef.current = latestCompletedTurn.prompt;
      setCanGoBackToSearch(true);
      dispatch(action);
    } else if (action?.type === 'NAVIGATE_CONVERSATION') {
      if (pendingLandingNavigationRef.current) {
        pendingLandingNavigationRef.current = false;
        dispatch(action);
      }
    }
  }, [converseState.turns, dispatch]);

  const handleSubmit = (prompt: string) => {
    if (!prompt.trim() || converseState.isStreaming) return;
    controller.submit({prompt});
    if (view === 'landing' || view === 'search') {
      pendingLandingNavigationRef.current = true;
    }
  };

  const handleBackToSearch = () => {
    if (persistedInterfaceRef.current) {
      persistedQueryRef.current = '';
      dispatch({type: 'NAVIGATE_SEARCH'});
    }
  };

  const handleResetToLanding = () => {
    if (persistedInterfaceRef.current) {
      persistedInterfaceRef.current.interface.dispose();
      persistedInterfaceRef.current = null;
      persistedInterfaceTurnIdRef.current = null;
      setCanGoBackToSearch(false);
    }
    controller.clear();
    dispatch({type: 'NAVIGATE_LANDING'});
  };

  const viewContent = (() => {
    switch (view) {
      case 'search':
        return (
          <SearchResultsPage
            key={persistedInterfaceTurnIdRef.current!}
            onSubmit={handleSubmit}
            isStreaming={converseState.isStreaming}
            routedInterface={persistedInterfaceRef.current!}
            query={persistedQueryRef.current}
          />
        );
      case 'conversation':
        return (
          <ConversationPage
            onSubmit={handleSubmit}
            isStreaming={converseState.isStreaming}
            turns={converseState.turns}
            onBackToSearch={handleBackToSearch}
            canGoBackToSearch={canGoBackToSearch}
            onResetToLanding={handleResetToLanding}
          />
        );
      default:
        return (
          <LandingPage
            onSubmit={handleSubmit}
            isStreaming={converseState.isStreaming}
          />
        );
    }
  })();

  return (
    <div key={view} className="view-transition">
      {viewContent}
    </div>
  );
}
