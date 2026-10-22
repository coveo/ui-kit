import {useCallback, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import {useSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {
  actionBarsBeforeLatestSearch,
  buildSurfaceStream,
  isActionBar,
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
  const isNextActions = useCallback(
    (surfaceId: string) => isActionBar(stream, surfaceId),
    [stream]
  );
  const hasAnswerBlocks = useMemo(
    () =>
      [...stream.surfacesByTurn.values()].some((surfaceIds) =>
        surfaceIds.some((surfaceId) => isAnswerBlock(stream, surfaceId))
      ),
    [stream]
  );

  // Next actions are suggested for the results shown when they were made. Once the shopper
  // changes those results, through a newer search or a facet, sort or page on the search surface,
  // the suggestions may name products that are gone, so they are withdrawn.
  const [refinedBars, setRefinedBars] = useState<ReadonlySet<string>>(() => new Set());
  const expiredActionBars = useMemo(
    () => new Set([...actionBarsBeforeLatestSearch(stream, turns), ...refinedBars]),
    [stream, turns, refinedBars]
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
        const surfaceId = (message as {userAction?: {surfaceId?: unknown}}).userAction?.surfaceId;
        if (typeof surfaceId === 'string' && isSearchSurface(stream, surfaceId)) {
          const bars = [...stream.surfacesByTurn.values()]
            .flat()
            .filter((renderId) => isActionBar(stream, renderId));
          setRefinedBars((current) => new Set([...current, ...bars]));
        }
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

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || session.request !== undefined) return;
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
    },
    [session]
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
                  isActionBar={isNextActions}
                  expiredActionBars={expiredActionBars}
                  hasAnswerBlocks={hasAnswerBlocks}
                />
              )}
            </div>
          </div>
        </ThermidorA2UIStream>
      </A2UIProvider>
    </SessionRequestProvider>
  );
}
