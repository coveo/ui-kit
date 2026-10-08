import {useCallback, useMemo, useRef, useSyncExternalStore} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {buildSurfaceStream, toServerAction} from '../a2ui/surface-stream.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';

const catalog = createThermidorCatalog();

/**
 * A single page: the landing page until the first prompt, then one conversation feed where each
 * turn shows the blocks the server produced, search blocks included.
 */
export function AppShell() {
  const session = useSession();

  const subscribe = useCallback(
    (onStoreChange: () => void) => session.subscribe(onStoreChange),
    [session]
  );
  const getTurns = useCallback(() => session.turns, [session]);
  const turns = useSyncExternalStore(subscribe, getTurns, getTurns);

  const isStreaming = useMemo(() => turns.some((turn) => turn.status === 'streaming'), [turns]);
  const stream = useMemo(() => buildSurfaceStream(turns), [turns]);

  const serverSurfaceIdsRef = useRef(stream.serverSurfaceIds);
  serverSurfaceIdsRef.current = stream.serverSurfaceIds;

  const handleAction = useCallback(
    (message: A2UIClientEventMessage) =>
      session.dispatchAction(toServerAction(message, serverSurfaceIdsRef.current)),
    [session]
  );

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || isStreaming) return;
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
    },
    [session, isStreaming]
  );

  return (
    <A2UIProvider catalog={catalog} onAction={handleAction}>
      <ThermidorA2UIStream messages={stream.messages} />
      <div className="view-shell">
        <div className="view-panel view-panel--active">
          {turns.length === 0 ? (
            <LandingPage onSubmit={handleSubmit} isStreaming={isStreaming} />
          ) : (
            <ConversationPage
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
              turns={[...turns]}
              surfacesByTurn={stream.surfacesByTurn}
            />
          )}
        </div>
      </div>
    </A2UIProvider>
  );
}
