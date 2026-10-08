import {useCallback, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {buildSurfaceStream, toServerAction} from '../a2ui/surface-stream.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {startFollowUp, type FollowUp} from './ConversationPage/turn-segments.js';

const catalog = createThermidorCatalog();

/** `NextActionsBar` actions: each one asks for a new answer rather than updating a block. */
const FOLLOW_UP_ACTIONS = new Set(['selectAction', 'selectSearchOption']);

const NO_SURFACES: readonly string[] = [];

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

  const [followUps, setFollowUps] = useState<ReadonlyMap<string, readonly FollowUp[]>>(
    () => new Map()
  );
  const [pendingTurnId, setPendingTurnId] = useState<string | null>(null);

  // An action's run streams into the turn already shown without marking it as streaming, so a
  // follow-up in flight counts as streaming here.
  const isStreaming = useMemo(
    () => pendingTurnId !== null || turns.some((turn) => turn.status === 'streaming'),
    [turns, pendingTurnId]
  );
  const stream = useMemo(() => buildSurfaceStream(turns), [turns]);

  const latestRef = useRef({turns, stream, isStreaming});
  latestRef.current = {turns, stream, isStreaming};

  const handleAction = useCallback(
    async (message: A2UIClientEventMessage) => {
      const {turns, stream, isStreaming} = latestRef.current;
      // The session does not count an action's run as streaming, so an action sent while a
      // follow-up is in flight would race it into the same turn.
      if (isStreaming) {
        return;
      }
      const serverMessage = toServerAction(message, stream.serverSurfaceIds);
      const userAction = (
        message as {userAction?: {name?: unknown; context?: Record<string, unknown>}}
      ).userAction;
      const turn = turns.at(-1);
      if (
        !turn ||
        typeof userAction?.name !== 'string' ||
        !FOLLOW_UP_ACTIONS.has(userAction.name)
      ) {
        return session.dispatchAction(serverMessage);
      }

      const text = userAction.context?.['text'];
      const followUp = startFollowUp(
        turn,
        stream.surfacesByTurn.get(turn.id) ?? NO_SURFACES,
        typeof text === 'string' ? text : undefined
      );
      setFollowUps((current) =>
        new Map(current).set(turn.id, [...(current.get(turn.id) ?? []), followUp])
      );
      setPendingTurnId(turn.id);
      try {
        await session.dispatchAction(serverMessage);
      } finally {
        setPendingTurnId(null);
      }
    },
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
              followUps={followUps}
              pendingTurnId={pendingTurnId}
            />
          )}
        </div>
      </div>
    </A2UIProvider>
  );
}
