import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {useNavigation} from '../hooks/use-navigation.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage/index.js';

const catalog = createThermidorCatalog();

export function AppShell() {
  const session = useSession();

  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session]
  );
  const getTurns = useCallback(() => session.turns, [session]);
  const turns = useSyncExternalStore(subscribe, getTurns, getTurns);

  const isStreaming = useMemo(() => turns.some((turn) => turn.status === 'streaming'), [turns]);

  const controller = useMemo(
    () => ({
      submit: (input: {prompt: string}) => {
        void session.submit(input);
      },
      clear: () => {
        // The session client has no reset; a fresh conversation is started by
        // submitting again. Kept as a no-op to satisfy the navigation contract.
      },
    }),
    [session]
  );

  const converseState = useMemo(() => ({turns: [...turns], isStreaming}), [turns, isStreaming]);

  const nav = useNavigation(controller, converseState);

  return (
    <A2UIProvider catalog={catalog}>
      <div className="view-shell">
        {nav.commerceSurfaceId && (
          <div className={`view-panel ${nav.view === 'search' ? 'view-panel--active' : ''}`}>
            <SearchResultsPage
              surfaceId={nav.commerceSurfaceId}
              onSubmit={nav.handleSubmit}
              isStreaming={isStreaming}
              query={nav.persistedQuery}
              onBackToConversation={nav.handleBackToConversation}
              products={nav.targetedProducts}
              onProductsChange={nav.setTargetedProducts}
            />
          </div>
        )}
        {nav.view !== 'search' && (
          <div className="view-panel view-panel--active">
            {nav.view === 'conversation' ? (
              <ConversationPage
                onSubmit={nav.handleSubmit}
                isStreaming={isStreaming}
                turns={converseState.turns}
                onBackToSearch={nav.handleBackToSearch}
                canGoBackToSearch={nav.canGoBackToSearch}
                products={nav.targetedProducts}
                onProductsChange={nav.setTargetedProducts}
              />
            ) : (
              <LandingPage onSubmit={nav.handleSubmit} isStreaming={isStreaming} />
            )}
          </div>
        )}
      </div>
    </A2UIProvider>
  );
}
