import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {isBlocking, SessionRequestProvider, submitQuery} from '../a2ui/session-request.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';

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
            <div className="view-panel view-panel--active">
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
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
