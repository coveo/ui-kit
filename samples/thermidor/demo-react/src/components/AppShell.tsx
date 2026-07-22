import {useEffect, useRef} from 'react';
import {buildConverseController, type RoutedInterface} from '@coveo/thermidor';
import {useGenerativeInterface} from '../context/generative-interface.js';
import {useBuildController} from '../hooks/use-build-controller.js';
import {useAppState} from '../hooks/use-app-state.js';
import {LandingPage} from './LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage.js';
import {ConversationPage} from './ConversationPage.js';

export function AppShell() {
  const generativeInterface = useGenerativeInterface();
  const [controller, converseState] = useBuildController(() =>
    buildConverseController({interface: generativeInterface})
  );

  const {view, dispatch} = useAppState();

  const persistedInterfaceRef = useRef<RoutedInterface | null>(null);
  const lastObservedTurnIdRef = useRef<string | null>(null);

  useEffect(() => {
    const turns = converseState.turns;
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

    if (latestCompletedTurn.routedInterface) {
      if (persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
      persistedInterfaceRef.current = latestCompletedTurn.routedInterface;
      dispatch({type: 'NAVIGATE_SEARCH'});
    } else if (latestCompletedTurn.agentResponse) {
      dispatch({type: 'NAVIGATE_CONVERSATION'});
    }
  }, [converseState.turns, dispatch]);

  const handleSubmit = (prompt: string) => {
    if (!prompt.trim() || converseState.isStreaming) return;
    controller.submit({prompt});
  };

  const handleBackToSearch = () => {
    if (persistedInterfaceRef.current) {
      dispatch({type: 'NAVIGATE_SEARCH'});
    }
  };

  const canGoBackToSearch = persistedInterfaceRef.current !== null;

  const handleResetToLanding = () => {
    if (persistedInterfaceRef.current) {
      persistedInterfaceRef.current.interface.dispose();
      persistedInterfaceRef.current = null;
    }
    controller.clear();
    dispatch({type: 'NAVIGATE_LANDING'});
  };

  const lastTurn = converseState.turns[converseState.turns.length - 1];
  const error =
    lastTurn?.status === 'error'
      ? (lastTurn.error ?? 'An error occurred')
      : null;

  switch (view) {
    case 'search':
      return (
        <SearchResultsPage
          onSubmit={handleSubmit}
          isStreaming={converseState.isStreaming}
          routedInterface={persistedInterfaceRef.current!}
          error={error}
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
          error={error}
        />
      );
    default:
      return (
        <LandingPage
          onSubmit={handleSubmit}
          isStreaming={converseState.isStreaming}
          error={error}
        />
      );
  }
}
