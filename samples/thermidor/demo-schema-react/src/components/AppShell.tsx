import {useCallback, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {
  buildSurfaceStream,
  isAnswerBlock,
  isSearchSurface,
  latestSearchSurfaceId,
  toServerAction,
} from '../a2ui/surface-stream.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';
import {isBlocking, SessionRequestProvider, useSessionRequest} from '../a2ui/session-request.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {startFollowUp, type FollowUp} from './ConversationPage/turn-segments.js';
import {LayoutToggle} from './LayoutToggle/LayoutToggle.js';
import {readLayout, writeLayout, type Layout} from './layout.js';

const catalog = createThermidorCatalog({productResearchCard: {maxLinks: 5}});

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
  const locked = isBlocking(useSessionRequest(session));

  // PROTOTYPE (COMSHOPX-1470): the layout is a client-only choice over the same stream.
  const [layout, setLayout] = useState<Layout>(readLayout);
  const changeLayout = useCallback((next: Layout) => {
    writeLayout(next);
    setLayout(next);
  }, []);
  const panelSurfaceId = useMemo(() => latestSearchSurfaceId(stream, turns), [stream, turns]);
  const isPanelSurface = useCallback(
    (surfaceId: string) => isSearchSurface(stream, surfaceId),
    [stream]
  );
  const hasAnswerBlocks = useMemo(
    () =>
      [...stream.surfacesByTurn.values()].some((surfaceIds) =>
        surfaceIds.some((surfaceId) => isAnswerBlock(stream, surfaceId))
      ),
    [stream]
  );

  const latestRef = useRef({turns, stream});
  latestRef.current = {turns, stream};

  const handleAction = useCallback(
    async (message: A2UIClientEventMessage) => {
      const userAction = (
        message as {userAction?: {name?: unknown; context?: Record<string, unknown>}}
      ).userAction;
      const name = typeof userAction?.name === 'string' ? userAction.name : undefined;
      // A follow-up marks where its answer starts in the turn, so nothing may stream in before it.
      if (name !== undefined && FOLLOW_UP_ACTIONS.has(name) && session.request !== undefined) {
        return;
      }
      const {turns, stream} = latestRef.current;
      const serverMessage = toServerAction(message, stream.serverSurfaceIds);
      const turn = turns.at(-1);
      if (!turn || name === undefined || !FOLLOW_UP_ACTIONS.has(name)) {
        return session.dispatchAction(serverMessage);
      }

      const text = userAction?.context?.['text'];
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

  // The turns started from the results panel's search box, by index. A search they run only
  // shows in the panel; the chat draws them only if the agent answers.
  const [panelTurnIndexes, setPanelTurnIndexes] = useState<ReadonlySet<number>>(() => new Set());

  const submitPrompt = useCallback(
    (prompt: string, fromPanel: boolean) => {
      if (!prompt.trim() || session.request !== undefined) return;
      if (fromPanel) {
        const index = session.turns.length;
        setPanelTurnIndexes((current) => new Set(current).add(index));
      }
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
    },
    [session]
  );
  const handleSubmit = useCallback((prompt: string) => submitPrompt(prompt, false), [submitPrompt]);
  const handlePanelSubmit = useCallback(
    (prompt: string) => submitPrompt(prompt, true),
    [submitPrompt]
  );

  return (
    <SessionRequestProvider value={session}>
      <A2UIProvider catalog={catalog} onAction={handleAction}>
        <ThermidorA2UIStream loadingSurfaces={stream.loadingSurfaces} messages={stream.messages}>
          <LayoutToggle layout={layout} onChange={changeLayout} />
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
                  surfacesByTurn={stream.surfacesByTurn}
                  followUps={followUps}
                  pendingTurnId={pendingTurnId}
                  layout={layout}
                  isSearchSurface={isPanelSurface}
                  panelSurfaceId={panelSurfaceId}
                  hasAnswerBlocks={hasAnswerBlocks}
                  onPanelSubmit={handlePanelSubmit}
                  panelTurnIndexes={panelTurnIndexes}
                />
              )}
            </div>
          </div>
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
