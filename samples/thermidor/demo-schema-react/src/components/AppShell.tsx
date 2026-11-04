import {useCallback, useMemo, useState, useSyncExternalStore} from 'react';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {
  isAnswerTakingActions,
  isBlocking,
  SessionRequestProvider,
  submitQuery,
} from '../a2ui/session-request.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {AssistantLayout} from './AssistantLayout/AssistantLayout.js';
import {LayoutSwitch} from './LayoutSwitch/LayoutSwitch.js';
import {readLayout, writeLayout, type Layout} from './layout.js';

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

  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );
  const {turns, a2uiMessages, request} = snapshot;
  // A new question may change direction during an answer the shopper can act beside.
  const canAddToAnswer = isAnswerTakingActions(snapshot);
  const locked = isBlocking(request) && !canAddToAnswer;

  const isStreaming = useMemo(() => turns.some((turn) => turn.status === 'streaming'), [turns]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      const current = session.getSnapshot();
      if (!prompt.trim() || (isBlocking(current.request) && !isAnswerTakingActions(current))) {
        return;
      }
      void submitQuery(session, prompt);
    },
    [session]
  );

  const handleStop = useCallback(() => {
    void session.stop();
  }, [session]);

  // PROTOTYPE (HACK-408): the layout is a client-only choice over the same session.
  const [layout, setLayout] = useState<Layout>(() => readLayout());
  const changeLayout = useCallback((next: Layout) => {
    writeLayout(next);
    setLayout(next);
  }, []);

  return (
    <SessionRequestProvider value={session}>
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <ThermidorA2UIStream messages={a2uiMessages}>
          <div className="view-shell">
            <div className="view-panel view-panel--active">
              {layout !== 'feed' ? (
                <AssistantLayout
                  mode={layout}
                  onModeChange={changeLayout}
                  layoutSwitch={<LayoutSwitch layout={layout} onChange={changeLayout} />}
                />
              ) : turns.length === 0 ? (
                <LandingPage onSubmit={handleSubmit} isStreaming={locked} />
              ) : (
                <ConversationPage
                  onSubmit={handleSubmit}
                  isStreaming={isStreaming}
                  promptDisabled={locked}
                  canAddToAnswer={canAddToAnswer}
                  onStop={handleStop}
                  turns={[...turns]}
                />
              )}
              {layout === 'feed' && <LayoutSwitch layout={layout} onChange={changeLayout} pinned />}
            </div>
          </div>
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
