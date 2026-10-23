import {useCallback, useMemo, useState, useSyncExternalStore} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {isBlocking, SessionRequestProvider} from '../a2ui/session-request.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {startFollowUp, type FollowUp} from './ConversationPage/turn-segments.js';

const catalog = createThermidorCatalog({
  comparisonTable: {maxLinks: 5},
  productResearchCard: {maxLinks: 5},
});

/** `NextActionsBar` actions: each one asks for a new answer rather than updating a block. */
const FOLLOW_UP_ACTIONS = new Set(['selectAction', 'selectSearchOption']);

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
  const loadingSurfaces = useMemo(
    () =>
      new Map(
        turns.flatMap((turn) =>
          turn.response.surfaces
            .filter((surface) => surface.isLoading)
            .map((surface) => [surface.surfaceId, surface.rootComponentType] as const)
        )
      ),
    [turns]
  );
  const locked = isBlocking(request);

  const handleAction = useCallback(
    async (message: A2UIClientEventMessage) => {
      const userAction = (
        message as {userAction?: {name?: unknown; context?: Record<string, unknown>}}
      ).userAction;
      const name = typeof userAction?.name === 'string' ? userAction.name : undefined;
      // A follow-up marks where its answer starts in the turn, so nothing may stream in before it.
      if (
        name !== undefined &&
        FOLLOW_UP_ACTIONS.has(name) &&
        session.getSnapshot().request !== undefined
      ) {
        return;
      }
      const turn = session.getSnapshot().turns.at(-1);
      if (!turn || name === undefined || !FOLLOW_UP_ACTIONS.has(name)) {
        return session.dispatchAction(message);
      }

      const text = userAction?.context?.['text'];
      const followUp = startFollowUp(turn, typeof text === 'string' ? text : undefined);
      setFollowUps((current) =>
        new Map(current).set(turn.id, [...(current.get(turn.id) ?? []), followUp])
      );
      setPendingTurnId(turn.id);
      try {
        await session.dispatchAction(message);
      } finally {
        setPendingTurnId(null);
      }
    },
    [session]
  );

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || session.getSnapshot().request !== undefined) return;
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
    },
    [session]
  );

  return (
    <SessionRequestProvider value={session}>
      <A2UIProvider catalog={catalog} onAction={handleAction}>
        <ThermidorA2UIStream loadingSurfaces={loadingSurfaces} messages={a2uiMessages}>
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
                  followUps={followUps}
                  pendingTurnId={pendingTurnId}
                />
              )}
            </div>
          </div>
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
