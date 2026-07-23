import {useEffect, useRef} from 'react';
import {buildConverseController, type RoutedInterface} from '@coveo/thermidor';
import {useGenerativeInterface} from '../context/generative-interface.js';
import {useBuildController} from '../hooks/use-build-controller.js';
import {useAppState, deriveTransitionAction} from '../hooks/use-app-state.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage.js';

export function AppShell() {
  const generativeInterface = useGenerativeInterface();
  const [controller, converseState] = useBuildController(() =>
    buildConverseController({interface: generativeInterface})
  );

  const {view, dispatch} = useAppState();

  const persistedInterfaceRef = useRef<RoutedInterface | null>(null);
  const persistedInterfaceTurnIdRef = useRef<string | null>(null);
  const lastObservedTurnIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      persistedInterfaceRef.current?.interface.dispose();
    };
  }, []);

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

    const action = deriveTransitionAction(latestCompletedTurn);

    if (
      action?.type === 'NAVIGATE_SEARCH' &&
      latestCompletedTurn.routedInterface
    ) {
      if (persistedInterfaceRef.current) {
        persistedInterfaceRef.current.interface.dispose();
      }
      persistedInterfaceRef.current = latestCompletedTurn.routedInterface;
      persistedInterfaceTurnIdRef.current = latestCompletedTurn.id;
      dispatch(action);
    } else if (action) {
      dispatch(action);
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
      persistedInterfaceTurnIdRef.current = null;
    }
    controller.clear();
    dispatch({type: 'NAVIGATE_LANDING'});
  };

  switch (view) {
    case 'search':
      return (
        <SearchResultsPage
          key={persistedInterfaceTurnIdRef.current!}
          onSubmit={handleSubmit}
          isStreaming={converseState.isStreaming}
          routedInterface={persistedInterfaceRef.current!}
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
}
