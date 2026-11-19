import {useCallback, useId, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {useConversations, useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {isBlocking, SessionRequestProvider, submitQuery} from '../a2ui/session-request.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {TopBar} from './TopBar/TopBar.js';
import {ConversationDrawer} from './ConversationDrawer/ConversationDrawer.js';

const catalog = createThermidorCatalog({
  comparisonTable: {maxLinks: 5},
  productResearchCard: {maxLinks: 5},
});

/**
 * A single page: the landing page until the first prompt, then one conversation feed where each
 * turn shows the blocks the server produced, search blocks included.
 */
export function AppShell() {
  const session = useSession();
  const {currentId} = useConversations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const drawerToggleRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = useCallback((returnFocus: boolean) => {
    setDrawerOpen(false);
    if (returnFocus) {
      drawerToggleRef.current?.focus();
    }
  }, []);

  const {turns, a2uiMessages, request} = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );
  const locked = isBlocking(request);

  const isStreaming = useMemo(() => turns.some((turn) => turn.status === 'streaming'), [turns]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || isBlocking(session.getSnapshot().request)) return;
      void submitQuery(session, prompt);
    },
    [session]
  );

  return (
    <SessionRequestProvider value={session}>
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <ThermidorA2UIStream messages={a2uiMessages}>
          <div className="view-shell">
            <TopBar
              drawerId={drawerId}
              drawerOpen={drawerOpen}
              onToggleDrawer={() => setDrawerOpen((open) => !open)}
              drawerToggleRef={drawerToggleRef}
            />
            <div className="view-body">
              {drawerOpen && (
                <ConversationDrawer
                  id={drawerId}
                  toggleRef={drawerToggleRef}
                  onClose={closeDrawer}
                />
              )}
              {/* Keyed by conversation, so another conversation starts with a fresh page. */}
              <div className="view-panel view-panel--active" key={currentId}>
                {turns.length === 0 ? (
                  <LandingPage onSubmit={handleSubmit} isStreaming={locked} />
                ) : (
                  <ConversationPage
                    onSubmit={handleSubmit}
                    isStreaming={isStreaming}
                    promptDisabled={locked}
                    turns={[...turns]}
                  />
                )}
              </div>
            </div>
          </div>
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
