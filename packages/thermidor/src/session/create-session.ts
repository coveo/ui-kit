/**
 * Session factory + runtime.
 *
 * `createSession(config)` returns a {@link Session}: the lean client handle for
 * one continuous, token-carrying interaction with the unified converse
 * endpoint.
 *
 * The session owns a plain {@link SessionStore} and drives it with the pure
 * {@link foldActivity} reduction, plus the initialize / dispatchAction / cancel /
 * retry / stream-consume orchestration.
 *
 * There are no singletons and no module-level mutable state: every call to
 * `createSession` builds a fresh store, so two sessions created from identical
 * configuration share no mutable state.
 */

import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent, RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import {createUnifiedEndpointClient} from '@/src/internal/api/unified/unified-endpoint-client.js';
import type {
  A2uiAction,
  InitializeAction,
  CommerceRequestModel,
} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {
  CommerceContextProvider,
  NavigatorContextProvider,
} from '@/src/internal/context/index.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {generateId} from '@/src/internal/utils/id-generator.js';
import {actionCacheKey, createActionCache, type ActionOrigin} from './action-cache.js';
import {validateActionPayload} from './action-payload-validation.js';
import {cachePolicy, isConcurrentAction, type CachePolicy} from './announced-actions.js';
import type {ContractsSchema} from './contracts.js';
import {createConcurrentLanes} from './concurrent-lanes.js';
import {callWithConflictRetry} from './conflict-retry.js';
import {
  EMPTY_RENDERER_STREAM,
  appendToRendererStream,
  convertA2uiMessages,
} from './a2ui-v09-projection.js';
import {createTurn, foldActivity, foldInitialization, SURFACE_ACTIVITY_KIND} from './fold.js';
import {deriveNodeIdentityRegistry} from './in-transit-validation.js';
import {restoreSession, serializeSession, type SerializedSession} from './serialize.js';
import {createSessionStore, type SessionStore, type SessionStoreState} from './store.js';
import {
  EMPTY_UNRECORDED_STATE,
  acceptUnrecordedWrites,
  applyInboundOps,
  applyUnrecordedWrites,
  overlayUnrecordedState,
  releaseUnrecordedState,
  type UnrecordedState,
} from './session-state.js';
import {isTurnOpeningAction} from './turn-opening.js';
import {
  INITIALIZATION,
  abandonedPlaceholderIds,
  deriveSessionSurfaces,
  sessionActivities,
  targetStatus,
  type RunTarget,
  type SessionSurfaceView,
} from './session-surfaces.js';
import type {
  A2uiState,
  A2uiV09Message,
  ActionError,
  DiscoveredSurface,
  SessionInitialization,
  SessionRequest,
  Turn,
  TurnAction,
  TurnInput,
} from './types.js';

/**
 * The standard A2-UI client-to-server message the frozen renderer delivers to
 * its `onAction` handler. {@link Session.dispatchAction} accepts this shape so it
 * is assignable to the renderer's `OnActionCallback` with no adapter.
 *
 * Declared structurally (not imported) so `@coveo/thermidor` stays
 * framework-agnostic: it depends on neither React nor the renderer package,
 * yet `onAction={session.dispatchAction}` type-checks against the renderer's
 * `(message: A2UIClientEventMessage) => void | Promise<void>` callback.
 */
export interface A2uiClientMessage {
  /**
   * The user interaction, when the message carries one. A message with no
   * `userAction` is dropped (nothing sent).
   */
  userAction?: {
    /** The action name declared by the dispatching component's contract. */
    name: string;
    /** The A2-UI surface the interaction originated on. */
    surfaceId: string;
    /** The id of the node that dispatched the action. Absent → dropped. */
    sourceComponentId?: string;
    /** The action payload, validated against the action's contract in transit. */
    context?: Record<string, unknown>;
    /** Optional client-provided timestamp (unused; the core stamps its own). */
    timestamp?: string;
    /** Optional data-context pointer (unused by the core dispatch path). */
    dataContextPath?: string;
  };
}

/**
 * Submits a prompt from outside A2-UI composition (for example, the
 * integrator's search box), opening a new streaming turn. Dispatched through
 * {@link Session.dispatchAction} like any other interaction, but it needs no
 * rendered component, surface, or active turn, so it also opens the first turn
 * of a session.
 */
export interface SubmitPromptAction {
  name: 'submitPrompt';
  payload: {
    /** The prompt recorded as the new turn's `input.prompt`. */
    prompt: string;
  };
}

/**
 * The configuration accepted by {@link createSession}.
 *
 * The context providers are pull-based and synchronous: the request builder
 * calls `navigatorContextProvider` and `commerceContextProvider` fresh per
 * request so the app's current context is always sent without thermidor-side
 * context state.
 */
export interface SessionConfig<TContracts extends ContractsSchema = ContractsSchema> {
  /**
   * The injected component contracts schema (a discriminated union on `component`,
   * each member carrying that component's `state` and `actions`). It is the SOLE
   * validation source for the session: inbound `updateDataModel` ops are validated
   * against the member's `state` (whole) / its sub-schema (partial sub-path), and
   * outbound action payloads against the member's `actions` for the dispatched
   * action name, before the POST. Injecting it here keeps `@coveo/thermidor`
   * decoupled from any concrete contract package, so the runtime works with any
   * A2-UI contract schema, not only `@coveo/thermidor-schema`.
   */
  contracts: TContracts;
  organizationId: string;
  accessToken: string;
  /**
   * Full converse URL override. When provided the client POSTs to it verbatim
   * (appending nothing); when absent the Coveo converse URL is derived from
   * `organizationId`.
   */
  endpoint?: string;
  /** Ambient navigator context, read fresh per request. */
  navigatorContextProvider?: NavigatorContextProvider;
  /**
   * App-owned commerce context (cart / pinnedProducts / source / custom), read
   * fresh per request. When absent, the request carries the structural-empty
   * "absent" encoding; when present, it carries the values the provider returns
   * as the "present" encoding, distinguishable on the wire from the absent
   * encoding even when the returned cart is empty.
   */
  commerceContextProvider?: CommerceContextProvider;
  /** Additional per-request commerce request fields (tracking/locale). */
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  /**
   * A previously-serialized session to restore at construction. When provided,
   * the store is seeded from the serialized session, reproducing the persisted
   * transcript and continuity keys (`sessionId`/`sessionToken`/`activeTurnId`)
   * so the restored session continues the same backend conversation.
   */
  sessionToRestore?: SerializedSession;
  /**
   * Whether the session opens itself with an `initialize` action, sent a microtask after
   * {@link createSession} returns so that a listener subscribed in the same task sees it start.
   * Defaults to `true`. A restored session never sends it. Pass
   * `false` for tests, or for a server that creates a session while rendering.
   */
  initialize?: boolean;
}

/**
 * The session's observable state as one immutable value, read through
 * {@link Session.getSnapshot}. Each field is the value of the {@link Session} member of the same
 * name at the time of the snapshot.
 */
export interface SessionSnapshot {
  /** The turns, as {@link Session.turns}. */
  readonly turns: readonly Turn[];
  /** The `initialize` run, as {@link Session.initialization}. */
  readonly initialization: SessionInitialization | undefined;
  /** Every live surface, as {@link Session.surfaces}. */
  readonly surfaces: readonly DiscoveredSurface[];
  /** The whole session's renderer stream, as {@link Session.a2uiMessages}. */
  readonly a2uiMessages: readonly A2uiV09Message[];
  /** The validated data model of every live surface, as {@link Session.state}. */
  readonly state: A2uiState;
  /** The request in flight, as {@link Session.request}. */
  readonly request: SessionRequest | undefined;
  /** The last component action that failed, as {@link Session.actionError}. */
  readonly actionError: ActionError | undefined;
}

/**
 * The client-side handle for one continuous interaction with the unified
 * converse endpoint. No engine, interface, or state-library object is reachable
 * from it.
 */
export interface Session<TContracts extends ContractsSchema = ContractsSchema> {
  /**
   * The injected contracts schema this session validates against. Retained on
   * the handle so the generic parameter is observable and the runtime threads
   * the exact contract that was injected.
   */
  readonly contracts: TContracts;
  /**
   * Readonly observable list of turns folded from the streamed response. Each turn's `surfaces`
   * are the live surfaces it created, so a transcript knows where to draw them.
   */
  readonly turns: readonly Turn[];
  /**
   * The run of the `initialize` action that opened the session, or `undefined` when the session
   * sent none. Not a turn. Only `initialize` changes its `status`; the surface snapshots of a
   * component action dispatched before the first turn are recorded here too, unless it opens one.
   * Once its `status` is `'error'`, no surface it would have created is coming; the first prompt
   * still opens the session.
   */
  readonly initialization: SessionInitialization | undefined;
  /**
   * Every live surface of the session, in creation order, whichever run created it. A
   * surface lives from its `createSurface` until its `deleteSurface`, and a `createSurface` for a
   * live id replaces that surface.
   */
  readonly surfaces: readonly DiscoveredSurface[];
  /**
   * The session's whole renderer stream, in the A2-UI v0.9 shape, in arrival order. It only
   * grows: feed each new message to a single renderer once. It follows the surface lifecycle
   * across runs: a `deleteSurface` precedes a `createSurface` that replaces a live surface, and an
   * operation on a surface that is not live is left out.
   */
  readonly a2uiMessages: readonly A2uiV09Message[];
  /**
   * The validated data model of every live surface, keyed by surface id, whichever turn wrote it:
   * inbound `updateDataModel` ops are validated against the injected contracts before they apply
   * here. The answers to concurrent actions are applied on top without being recorded: a later
   * recorded write to the same path replaces them, and {@link Session.serialize} leaves them out.
   */
  readonly state: A2uiState;
  /**
   * Why the last component action failed, and which action it was, or `undefined`. An action never
   * changes a turn's status: when it fails, whether the endpoint rejects it (after the session's
   * own bounded retries for concurrency conflicts), it streams `RUN_ERROR`, its stream ends
   * without a terminal event, or its request cannot be built, only this reports it, so a consumer
   * can show it next to the block that dispatched it. Any optimistic state tied to the action is
   * released and the last authoritative state shows again. Cleared once the next action or prompt
   * is sent. Changes notify {@link Session.subscribe} listeners.
   */
  readonly actionError: ActionError | undefined;
  /**
   * The request the session is sending, or `undefined` when it is idle. The session sends one
   * request at a time, `initialize`, prompts and actions alike, in the order they were dispatched;
   * an action's run counts, a follow-up included. An action the producer announces as concurrent
   * is sent beside it and never sets it. Read it synchronously, or through {@link Session.subscribe}.
   */
  readonly request: SessionRequest | undefined;
  /**
   * Registers a listener invoked once per change to the turn list, the initialization,
   * `actionError` or `request`. Does not rely on `this`, so it can be passed by reference.
   */
  subscribe(listener: () => void): () => void;
  /**
   * Returns the session's turns, initialization, surfaces, renderer stream, state, request in
   * flight and action error as one immutable {@link SessionSnapshot}. The same object is returned until one of its fields
   * changes, so it can back any store that subscribes through {@link Session.subscribe} and
   * compares snapshots by reference, such as React's
   * `useSyncExternalStore(session.subscribe, session.getSnapshot)`. Does not rely on `this`, so
   * it can be passed by reference.
   */
  getSnapshot(): SessionSnapshot;
  /**
   * Calls `send`, which dispatches through the renderer, and resolves once the session has answered
   * that dispatch, whatever the outcome: answered, failed, cancelled, or withheld without being
   * sent: it waits for {@link Session.request} to be `undefined`, right away when the dispatch was
   * withheld, otherwise once its request ends. For example, it ends an optimistic update. A
   * renderer's own dispatch promise may resolve as soon as it has emitted the action, before the
   * session has answered it; when the {@link Session.dispatchAction} promise is at hand, await it
   * instead.
   */
  sendAndWait(send: () => unknown): Promise<void>;
  /**
   * The single consumer-facing action-dispatch entry point, wired directly as
   * the renderer's `onAction` handler (`onAction={session.dispatchAction}`).
   *
   * The session sends one request at a time: a dispatch made while another request is in flight
   * is withheld, a prompt included. The returned Promise resolves once the dispatch's own request
   * ends.
   *
   * A {@link SubmitPromptAction} opens a new streaming turn for its prompt, and resolves once that
   * turn's stream ends.
   *
   * An {@link A2uiClientMessage} is unwrapped to its `userAction`: the session
   * recovers the dispatching component's discriminant from the session's live
   * surfaces, whichever turn created them, validates the action payload against the component's contract
   * internally, and — on success — POSTs the action to the converse endpoint.
   *
   * An action the producer announces as opening a turn, such as a follow-up
   * chip, opens a new streaming turn whose `input.action` records it, as a prompt does, and its
   * answer streams there; it resolves once that turn's stream ends. It needs no active turn, so it
   * may open the first turn of a session. Any other action only updates the surfaces: its surface
   * snapshots are recorded with the active turn, or with {@link Session.initialization} before the
   * first turn, and its failure sets {@link Session.actionError}.
   *
   * An action the producer announces as concurrent is sent at once, whatever request is in flight,
   * and resolves once its answer ends; a prompt or {@link Session.cancel} does not stop it. Only the
   * latest dispatch from a node is applied: an older request in flight is aborted, unless the
   * producer announces the action as cached. Then a dispatch already answered within the announced
   * lifetime sends nothing, and the request runs to the end so its answer is cached. Its answer may
   * only update the data model of nodes the session already holds, and is not recorded in a run.
   * Its failure is a dev-only warning: it sets no {@link Session.actionError}. It is withheld until
   * the session has its token.
   *
   * FIRE-AND-FORGET: the returned Promise ALWAYS resolves and NEVER rejects, so
   * the consumer needs no `.catch`. A message with no `userAction`, no
   * `sourceComponentId`, a node that resolves to no component, and an internal
   * dispatch rejection (for example an invalid payload) are all dropped with a
   * dev-only warning and nothing is sent.
   */
  dispatchAction: (message: A2uiClientMessage | SubmitPromptAction) => Promise<void>;
  /**
   * Stops the request in flight, `initialize` included, but no concurrent action. {@link Session.request} stays set until the stopped request has
   * unwound, a few microtasks later, so a dispatch made right after `cancel()` is withheld: wait for
   * `request` to become `undefined`, through {@link Session.subscribe}, before sending the next one.
   */
  cancel(): void;
  /**
   * Re-submits the input of the last turn when it errored: its prompt, or the action that opened
   * it, sent again from the surface it was dispatched from. Withheld like any dispatch while a
   * request is in flight. An earlier turn is not retried: its answer would land before later turns.
   */
  retry(turnId: string): void;
  /** Serializes the session transcript for persistence. */
  serialize(): SerializedSession;
}

function isSubmitPromptAction(
  message: A2uiClientMessage | SubmitPromptAction
): message is SubmitPromptAction {
  return 'name' in message && message.name === 'submitPrompt';
}

/** The action a request sends, which its failures are reported against. */
type ActionSource = Omit<ActionError, 'message'>;

/** A dispatched action, with the discriminant of the node it came from. */
interface RecoveredAction {
  discriminant: string;
  name: string;
  sourceComponentId: string;
  surfaceId: string;
  context: unknown;
}

/** The messages of an A2-UI surface snapshot, or `undefined` for any other event. */
function surfaceSnapshotMessages(event: NormalizedStreamEvent): readonly unknown[] | undefined {
  const snapshot = event as unknown as {activityType?: string; content?: unknown};
  const messages = (snapshot.content as Record<string, unknown> | undefined)?.['messages'];
  return snapshot.activityType === SURFACE_ACTIVITY_KIND && Array.isArray(messages)
    ? messages
    : undefined;
}

interface RequestFailure {
  error: string;
  /** The endpoint kept rejecting it as concurrent, past the retry budget. */
  conflict: boolean;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * True when a stream has been superseded by a newer one: a different stream is
 * now active. A plain cancel resets the active controller to `null` (no
 * successor), which is NOT superseded — that stream still reports its outcome.
 */
function isSuperseded(active: AbortController | null, streamController: AbortController): boolean {
  return active !== null && active !== streamController;
}

function requestTarget(request: SessionRequest): RunTarget {
  return request.kind === 'initialize' || request.turnId === undefined
    ? INITIALIZATION
    : {kind: 'turn', turnId: request.turnId};
}

function turnTarget(turnId: string): RunTarget {
  return {kind: 'turn', turnId};
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return 'An unexpected error occurred while reading the conversation stream.';
}

/**
 * Extracts the session continuity keys carried by turn-lifecycle events. These
 * are session-level (not turn-level) and so are captured by the runtime rather
 * than the fold.
 */
function readSessionKeys(
  event: NormalizedStreamEvent
): {sessionId?: string; sessionToken?: string} | undefined {
  if (
    event.type !== 'RUN_STARTED' &&
    event.type !== 'RUN_FINISHED' &&
    event.type !== 'turn_started' &&
    event.type !== 'turn_complete'
  ) {
    const raw = event as unknown as Record<string, unknown>;
    if (raw.type !== 'error') {
      return undefined;
    }
  }
  const raw = event as unknown as {
    conversationSessionId?: string;
    conversationToken?: string;
  };
  if (raw.conversationSessionId || raw.conversationToken) {
    return {sessionId: raw.conversationSessionId, sessionToken: raw.conversationToken};
  }
  return undefined;
}

/**
 * Creates a {@link Session} over a fresh observable store + fold.
 */
export function createSession<TContracts extends ContractsSchema>(
  config: SessionConfig<TContracts>
): Session<TContracts> {
  const initialState: SessionStoreState<Turn> = config.sessionToRestore
    ? restoreSession(config.sessionToRestore)
    : {
        turns: [],
        activeTurnId: undefined,
        sessionId: undefined,
        sessionToken: undefined,
        state: {},
        rendererStream: EMPTY_RENDERER_STREAM,
      };

  const store: SessionStore<Turn> = createSessionStore<Turn>(initialState);

  let surfaceView: SessionSurfaceView | undefined;
  let surfaceViewSource:
    | {turns: readonly Turn[]; initialization?: SessionInitialization; request?: SessionRequest}
    | undefined;
  // The placeholders the request's run had abandoned when the request started.
  let requestAbandoned: {request: SessionRequest; ids: ReadonlySet<string>} | undefined;
  function readSurfaceView(): SessionSurfaceView {
    const {turns, initialization, request} = store.getState();
    if (
      surfaceView === undefined ||
      surfaceViewSource?.turns !== turns ||
      surfaceViewSource.initialization !== initialization ||
      surfaceViewSource.request !== request
    ) {
      const abandoned =
        request && requestAbandoned?.request === request ? requestAbandoned.ids : undefined;
      surfaceView = deriveSessionSurfaces(
        {turns, initialization},
        request && requestTarget(request),
        abandoned
      );
      surfaceViewSource = {turns, initialization, request};
    }
    return surfaceView;
  }

  // The state of the live surfaces only, with the unrecorded writes on top, recomputed when the
  // state, those writes or the surfaces change.
  let liveState: A2uiState = {};
  let liveStateSource: {
    state?: A2uiState;
    unrecordedState?: UnrecordedState;
    view?: SessionSurfaceView;
  } = {};
  function readLiveState(): A2uiState {
    const {state = {}, unrecordedState = EMPTY_UNRECORDED_STATE} = store.getState();
    const view = readSurfaceView();
    if (
      liveStateSource.state !== state ||
      liveStateSource.unrecordedState !== unrecordedState ||
      liveStateSource.view !== view
    ) {
      const live = new Set(view.surfaces.map((surface) => surface.surfaceId));
      liveState = Object.fromEntries(
        Object.entries(overlayUnrecordedState(state, unrecordedState)).filter(([surfaceId]) =>
          live.has(surfaceId)
        )
      );
      liveStateSource = {state, unrecordedState, view};
    }
    return liveState;
  }

  const client = createUnifiedEndpointClient();
  const actionCache = createActionCache();
  const lanes = createConcurrentLanes();

  // The currently in-flight stream's abort controller, or null when idle. Held
  // per session instance — never module-level — so two sessions never contend.
  let activeAbortController: AbortController | null = null;

  // One request at a time: the endpoint handles a single request per session, and each response
  // is a whole-node snapshot, so overlapping streams would let the last to ARRIVE win over a newer
  // action sent later. A dispatch made while a request is in flight is withheld.
  async function sendRequest(
    request: SessionRequest,
    send: (abortController: AbortController) => Promise<void>,
    abandoned?: ReadonlySet<string>
  ): Promise<void> {
    if (store.getState().request) {
      devWarn('dispatchAction: withheld: another request is in flight.');
      return withhold();
    }
    // Armed before it is published, so a listener's `cancel()` stops the request it was told about.
    const abortController = new AbortController();
    activeAbortController = abortController;
    requestAbandoned = abandoned && {request, ids: abandoned};
    store.setState((current) => ({...current, request}));
    if (!abortController.signal.aborted) {
      try {
        await send(abortController);
      } catch (error) {
        devWarn(`dispatchAction: request failed: ${getErrorMessage(error)}`);
      }
    }
    if (activeAbortController === abortController) {
      activeAbortController = null;
    }
    store.setState((current) => ({...current, request: undefined}));
  }

  /** A dispatch refused before it was sent settles at once. */
  function withhold(): Promise<void> {
    return Promise.resolve();
  }

  function sendAndWait(send: () => unknown): Promise<void> {
    // The dispatch publishes its request synchronously, inside `send`.
    send();
    return new Promise((resolve) => {
      const settle = () => {
        if (store.getState().request === undefined) {
          unsubscribe();
          resolve();
        }
      };
      const unsubscribe = store.subscribe(settle);
      settle();
    });
  }

  function setActionError(actionError: ActionError | undefined): void {
    if (store.getState().actionError !== actionError) {
      store.setState((current) => ({...current, actionError}));
    }
  }

  function replaceTurn(turnId: string, update: (turn: Turn) => Turn): void {
    store.setState((current) => {
      const index = current.turns.findIndex((turn) => turn.id === turnId);
      if (index === -1) {
        return current;
      }
      const nextTurns = current.turns.slice();
      nextTurns[index] = update(nextTurns[index]);
      return {...current, turns: nextTurns};
    });
  }

  /** Folds `event` into the run `target` records, or returns `current` when that run is gone. */
  function foldIntoRun(
    current: SessionStoreState<Turn>,
    target: RunTarget,
    event: NormalizedStreamEvent
  ): SessionStoreState<Turn> {
    if (target.kind === 'initialization') {
      return current.initialization
        ? {...current, initialization: foldInitialization(current.initialization, event)}
        : current;
    }
    const index = current.turns.findIndex((turn) => turn.id === target.turnId);
    if (index === -1) {
      return current;
    }
    const turns = current.turns.slice();
    turns[index] = foldActivity(turns[index], event);
    return {...current, turns};
  }

  /**
   * Folds `event` into its run and, for a surface snapshot, applies its validated ops to the
   * session's state and appends its messages to the renderer stream, in one change.
   */
  function foldEvent(target: RunTarget, event: NormalizedStreamEvent): void {
    store.setState((current) => {
      const next = foldIntoRun(current, target, event);
      if (next === current) {
        return current;
      }
      const snapshot = event as unknown as {activityType?: string; content?: unknown};
      const content = snapshot.content as Record<string, unknown> | undefined;
      const messages = content?.['messages'];
      if (
        event.type === 'ACTIVITY_SNAPSHOT' &&
        snapshot.activityType === SURFACE_ACTIVITY_KIND &&
        Array.isArray(messages)
      ) {
        const activities = sessionActivities(next);
        next.state = applyInboundOps(
          current.state ?? {},
          activities,
          content as Record<string, unknown>,
          config.contracts
        );
        if (current.unrecordedState) {
          next.unrecordedState = releaseUnrecordedState(
            current.unrecordedState,
            activities,
            content as Record<string, unknown>,
            config.contracts
          );
        }
        next.rendererStream = appendToRendererStream(
          current.rendererStream ?? EMPTY_RENDERER_STREAM,
          convertA2uiMessages(messages)
        );
      }
      return next;
    });
  }

  function settleRun(
    target: RunTarget,
    settle: (run: Pick<Turn, 'status' | 'error'>) => Pick<Turn, 'status' | 'error'>
  ): void {
    if (target.kind === 'turn') {
      replaceTurn(target.turnId, (turn) => ({...turn, ...settle(turn)}));
      return;
    }
    store.setState((current) =>
      current.initialization
        ? {
            ...current,
            initialization: {...current.initialization, ...settle(current.initialization)},
          }
        : current
    );
  }

  function failRun(target: RunTarget, error: string): void {
    settleRun(target, () => ({status: 'error', error}));
  }

  // An action streams into a run that is already complete; cancelling it must leave that run be.
  function cancelRun(target: RunTarget): void {
    settleRun(target, (run) =>
      run.status === 'streaming' ? {status: 'error', error: 'Cancelled'} : run
    );
  }

  /**
   * Builds the request fields shared by prompt turns and the private dispatch path,
   * invoking BOTH context providers fresh at request-build time. Because the providers
   * are functions, context is never stored on the session and is never
   * serialized; a restored session therefore reads today's context from the
   * providers rather than any persisted value.
   *
   * Commerce-context encoding — the two encodings are
   * distinguishable on the wire:
   *   - ABSENT (no `commerceContextProvider`): `cart: []` with NO
   *     `pinnedProducts`, NO `source`, NO `custom`.
   *   - PRESENT (`commerceContextProvider` supplied): the provider's `cart`
   *     (meaningful even when empty) plus `pinnedProducts`, `source`, and
   *     `custom` carried from what the provider returns.
   */
  function buildBaseRequest(): Omit<CommerceRequestModel, 'message' | 'action'> {
    const navigatorContext = config.navigatorContextProvider?.();
    const commerceContext = config.commerceContextProvider?.();
    const {sessionId, sessionToken} = store.getState();

    const view = {
      url: navigatorContext?.location ?? null,
      referrer: navigatorContext?.referrer ?? null,
    };
    const user: Record<string, unknown> = {userAgent: navigatorContext?.userAgent ?? null};

    const base: Omit<CommerceRequestModel, 'message' | 'action'> = {
      trackingId: config.trackingId ?? '',
      language: config.language ?? '',
      country: config.country ?? '',
      currency: config.currency ?? '',
      clientId: navigatorContext?.clientId ?? undefined,
      conversationSessionId: sessionId,
      conversationToken: sessionToken,
      context:
        commerceContext === undefined
          ? // "absent" encoding: cart only, no source/custom.
            {view, user, cart: []}
          : // "present" encoding: carry the provider's fields verbatim.
            {
              view,
              user,
              cart: commerceContext.cart,
              source: commerceContext.source ?? [],
              custom: commerceContext.custom ?? {},
            },
    };

    if (commerceContext !== undefined) {
      base.pinnedProducts = commerceContext.pinnedProducts ?? [];
    }

    return base;
  }

  function buildConversationRequest(prompt: string): CommerceRequestModel {
    return {...buildBaseRequest(), message: prompt, action: null};
  }

  function buildActionRequest(action: A2uiAction | InitializeAction): CommerceRequestModel {
    return {...buildBaseRequest(), message: null, action};
  }

  /**
   * An `action`'s stream folds only its surface snapshots into `target`, and its failure sets
   * `actionError` (ADR-018, as amended).
   */
  async function consumeStream(
    target: RunTarget,
    stream: ReadableStream<Uint8Array>,
    abortController: AbortController,
    action: ActionSource | undefined
  ): Promise<void> {
    let terminalEventReceived = false;
    const fail = (message: string) =>
      action ? setActionError({message, ...action}) : failRun(target, message);

    await readEventStream({
      stream,
      signal: abortController.signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);

        const keys = readSessionKeys(event);
        if (keys) {
          store.setState((current) => ({
            ...current,
            sessionId: keys.sessionId ?? current.sessionId,
            sessionToken: keys.sessionToken ?? current.sessionToken,
          }));
        }

        // The run an action streams into keeps its own status and response (ADR-018).
        if (action) {
          if (event.type === 'RUN_ERROR') {
            terminalEventReceived = true;
            fail((event as {message?: string}).message || 'An error occurred during the action.');
          } else if (event.type === 'RUN_FINISHED' || event.type === 'turn_complete') {
            terminalEventReceived = true;
          } else if (event.type === 'ACTIVITY_SNAPSHOT') {
            foldEvent(target, event);
          }
          return;
        }

        foldEvent(target, event);

        const foldedStatus = targetStatus(store.getState(), target);
        if (foldedStatus === 'complete' || foldedStatus === 'error') {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        // A cancelled stream keeps its outcome, and a superseded one leaves it to the newer stream.
        if (
          !terminalEventReceived &&
          !abortController.signal.aborted &&
          !isSuperseded(activeAbortController, abortController)
        ) {
          fail('Stream ended without a terminal event.');
        }
      },
      onError: (error) => {
        if (terminalEventReceived || isSuperseded(activeAbortController, abortController)) {
          return;
        }
        if (isAbortError(error)) {
          cancelRun(target);
        } else {
          fail(getErrorMessage(error));
        }
      },
    });
  }

  /**
   * Takes a builder so a throwing context provider fails the run inside the `try`. A request the
   * endpoint rejected before streaming is returned for the caller to report; anything later is
   * folded into `target` here. An `action` reports
   * every later failure in `actionError` instead and leaves the run as it is (ADR-018, as amended).
   */
  async function executeStream(
    target: RunTarget,
    buildRequest: () => CommerceRequestModel,
    abortController: AbortController,
    action?: ActionSource
  ): Promise<RequestFailure | undefined> {
    try {
      // Rebuilt on every attempt, so context providers and session keys are read fresh.
      const result = await callWithConflictRetry(
        () =>
          client.call(
            buildRequest(),
            {
              organizationId: config.organizationId,
              accessToken: config.accessToken,
              endpoint: config.endpoint,
            },
            {signal: abortController.signal}
          ),
        abortController.signal
      );

      if (!result.success) {
        // The client reports an abort as a failed call rather than throwing it.
        if (abortController.signal.aborted) {
          if (!isSuperseded(activeAbortController, abortController)) {
            cancelRun(target);
          }
          return undefined;
        }
        return {error: result.error, conflict: result.conflict !== undefined};
      }

      await consumeStream(target, result.data.stream, abortController, action);
    } catch (error) {
      // A stream aborted because a NEWER stream superseded it must not touch the
      // turn: the newer stream owns the outcome. A plain cancel (controller reset
      // to null) still reports the failure.
      if (isSuperseded(activeAbortController, abortController)) {
        return;
      }
      if (isAbortError(error)) {
        cancelRun(target);
        return;
      }
      if (action) {
        setActionError({message: getErrorMessage(error), ...action});
      } else {
        failRun(target, getErrorMessage(error));
      }
    } finally {
      if (activeAbortController === abortController) {
        activeAbortController = null;
      }
    }
    return undefined;
  }

  async function streamPrompt(
    turnId: string,
    prompt: string,
    abortController: AbortController
  ): Promise<void> {
    setActionError(undefined);
    const target = turnTarget(turnId);
    const failure = await executeStream(
      target,
      () => buildConversationRequest(prompt),
      abortController
    );
    if (failure) {
      failRun(target, failure.error);
    }
  }

  function openTurn(turnId: string, input: TurnInput): void {
    store.setState((current) => ({
      ...current,
      turns: [...current.turns, createTurn(turnId, input)],
      activeTurnId: turnId,
    }));
  }

  /**
   * Stops consuming the in-flight stream. A streaming prompt turn, or a streaming initialization, is
   * marked `error`, retaining whatever it has already folded; an action in flight leaves the run it
   * is recorded with unchanged. `request` is cleared once the stopped request has unwound, not here.
   * When nothing is in flight, it is a no-op that leaves every run unchanged.
   */
  function cancel(): void {
    if (!activeAbortController) {
      return;
    }

    activeAbortController.abort();
    activeAbortController = null;

    // The abort races the stream reader, so the run is settled here rather than on its error path.
    const {request} = store.getState();
    if (request) {
      cancelRun(requestTarget(request));
    }
  }

  /** Its run is recorded as the initialization, never as a turn. */
  function initialize(): Promise<void> {
    return sendRequest({kind: 'initialize'}, async (abortController) => {
      store.setState((current) => ({
        ...current,
        initialization: {activities: [], status: 'streaming'},
      }));
      const failure = await executeStream(
        INITIALIZATION,
        () =>
          buildActionRequest({
            name: 'initialize',
            timestamp: new Date().toISOString(),
            actionId: null,
            wantResponse: false,
            context: {},
          }),
        abortController
      );
      if (failure) {
        failRun(INITIALIZATION, failure.error);
      }
    });
  }

  /**
   * Opens a new turn for `prompt` and streams its response. Needs no active turn, so it also
   * opens the first turn of a session.
   */
  function startPromptTurn(prompt: string | undefined): Promise<void> {
    const turnId = generateId();
    return sendRequest({kind: 'prompt', turnId}, async (abortController) => {
      openTurn(turnId, {prompt});
      await streamPrompt(turnId, prompt ?? '', abortController);
    });
  }

  /**
   * Validates the action payload against the component's generated Zod action schema before the
   * POST. A non-conforming payload is withheld (nothing sent).
   */
  function hasValidPayload(recovered: RecoveredAction): boolean {
    const validation = validateActionPayload(
      recovered.discriminant,
      recovered.name,
      recovered.context,
      config.contracts
    );
    if (!validation.valid) {
      devWarn(
        `dispatchAction: dispatch withheld: Invalid payload for action "${recovered.name}" on component "${recovered.discriminant}": ${validation.reason}`
      );
    }
    return validation.valid;
  }

  /**
   * Private validate-and-send path. Validates the recovered action's payload against the
   * component's generated Zod action schema and withholds on failure; targets the action's own
   * originating surface, any live surface of the session (ADR-018). An action the producer
   * announced as opening a turn opens one, even before the first turn (ADR-019); any other is
   * recorded with the active turn, or with the initialization before the first turn.
   * Withholds when there is neither to stream the answer into.
   */
  function issueAction(recovered: RecoveredAction): Promise<void> {
    const current = store.getState();
    const activities = sessionActivities(current);
    if (isConcurrentAction(activities, recovered.surfaceId, recovered.name)) {
      return issueConcurrentAction(
        recovered,
        cachePolicy(activities, recovered.surfaceId, recovered.name)
      );
    }
    const opensTurn = isTurnOpeningAction(activities, recovered.surfaceId, recovered.name);
    const {activeTurnId, initialization} = current;
    if (!opensTurn && !activeTurnId && !initialization) {
      return withhold();
    }

    // `recovered.surfaceId` is already validated upstream by `recoverDiscriminant`
    // (it resolves a discriminant only for a `(surfaceId, sourceComponentId)` in
    // the session's registry, built from every turn), so the origin surface is used
    // as-is — no re-check, and a conversation-only surface reaches itself, not a
    // commerce one.
    const surfaceId = recovered.surfaceId;

    if (!hasValidPayload(recovered)) {
      return withhold();
    }

    const a2uiAction: A2uiAction = {
      surfaceId,
      name: recovered.name,
      sourceComponentId: recovered.sourceComponentId,
      timestamp: new Date().toISOString(),
      context: recovered.context,
    };

    const target: RunTarget = opensTurn
      ? turnTarget(generateId())
      : activeTurnId
        ? turnTarget(activeTurnId)
        : INITIALIZATION;
    const request: SessionRequest = {
      kind: 'action',
      component: recovered.discriminant,
      name: recovered.name,
      surfaceId,
      sourceComponentId: recovered.sourceComponentId,
      ...(target.kind === 'turn' ? {turnId: target.turnId} : {}),
    };
    // An answer streamed into an earlier run must not bring back what that run left behind.
    const abandoned = opensTurn ? undefined : abandonedPlaceholderIds(current, target);
    return sendRequest(
      request,
      async (abortController) => {
        if (opensTurn && target.kind === 'turn') {
          openTurn(target.turnId, {
            action: {
              component: recovered.discriminant,
              name: recovered.name,
              surfaceId: recovered.surfaceId,
              sourceComponentId: recovered.sourceComponentId,
              ...(recovered.context === undefined ? {} : {context: recovered.context}),
            },
          });
        }
        await streamAction(
          target,
          a2uiAction,
          {
            component: recovered.discriminant,
            name: recovered.name,
            surfaceId,
            sourceComponentId: recovered.sourceComponentId,
          },
          opensTurn,
          abortController
        );
      },
      abandoned
    );
  }

  /**
   * Sends an action the producer announced as concurrent beside the session's single request
   * (ADR-020): it never sets `request`, and a prompt or `cancel()` never aborts it. Only the latest
   * dispatch from its node is applied. A cached action is answered from the cache when it can, and
   * its miss runs to the end so its answer is cached. Its answer is applied without being recorded
   * in a run, and its failure is only a development warning.
   */
  function issueConcurrentAction(
    recovered: RecoveredAction,
    policy: CachePolicy | undefined
  ): Promise<void> {
    if (!store.getState().sessionToken) {
      devWarn(`dispatchAction: ${recovered.name} withheld: the session has no token yet.`);
      return withhold();
    }
    if (!hasValidPayload(recovered)) {
      return withhold();
    }

    const key = actionCacheKey(recovered, recovered.context);
    lanes.claim(recovered, key);
    const cached = policy && actionCache.get(key);
    if (cached) {
      applyUnrecorded(cached);
      return Promise.resolve();
    }

    const action: A2uiAction = {
      surfaceId: recovered.surfaceId,
      name: recovered.name,
      sourceComponentId: recovered.sourceComponentId,
      timestamp: new Date().toISOString(),
      context: recovered.context,
    };
    if (!policy) {
      return lanes.sendUncached(recovered, (signal) =>
        quietly(recovered, streamUnrecorded(action, recovered, key, signal), signal)
      );
    }
    return lanes.sendCachedMiss(key, () =>
      quietly(
        recovered,
        streamUnrecorded(action, recovered, key).then((messages) =>
          actionCache.set(key, messages, policy.ttlMs)
        )
      )
    );
  }

  async function quietly(
    origin: ActionOrigin,
    work: Promise<unknown>,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      await work;
    } catch (error) {
      if (!signal?.aborted) {
        devWarn(`dispatchAction: ${origin.name} failed: ${getErrorMessage(error)}`);
      }
    }
  }

  /**
   * Sends a concurrent action and applies each surface snapshot of its answer while the dispatch is
   * its node's latest, checked before each write. Its session keys and metadata are not read.
   * Resolves with the answer's messages once the stream ends with a terminal event; when the
   * dispatch became the latest again after a snapshot was passed over, the whole answer is applied
   * then. Rejects when the request fails.
   */
  async function streamUnrecorded(
    action: A2uiAction,
    origin: ActionOrigin,
    key: string,
    signal?: AbortSignal
  ): Promise<readonly unknown[]> {
    const result = await client.call(
      buildActionRequest(action),
      {
        organizationId: config.organizationId,
        accessToken: config.accessToken,
        endpoint: config.endpoint,
      },
      {signal}
    );
    if (!result.success) {
      throw new Error(result.error);
    }

    const answer: unknown[] = [];
    let passedOver = false;
    let finished = false;
    let runError: string | undefined;
    await readEventStream({
      stream: result.data.stream,
      signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);
        if (event.type === 'RUN_ERROR') {
          runError =
            (event as {message?: string}).message || 'An error occurred during the action.';
        } else if (event.type === 'RUN_FINISHED' || event.type === 'turn_complete') {
          finished = true;
        } else if (event.type === 'ACTIVITY_SNAPSHOT') {
          const messages = surfaceSnapshotMessages(event);
          if (messages) {
            answer.push(...messages);
            if (lanes.isLatest(origin, key)) {
              applyUnrecorded(messages);
            } else {
              passedOver = true;
            }
          }
        }
      },
    });
    if (runError !== undefined) {
      throw new Error(runError);
    }
    if (!finished) {
      throw new Error('Stream ended without a terminal event.');
    }
    if (passedOver && lanes.isLatest(origin, key)) {
      applyUnrecorded(answer);
    }
    return answer;
  }

  /**
   * Applies an unrecorded answer: only its writes to the data model of nodes the recorded runs
   * hold, validated once, reach the renderer stream and the unrecorded layer over the state.
   */
  function applyUnrecorded(messages: readonly unknown[]): void {
    const current = store.getState();
    const accepted = acceptUnrecordedWrites(messages, sessionActivities(current), config.contracts);
    if (accepted.messages.length < messages.length) {
      devWarn(
        'dispatchAction: a concurrent answer may only update the data model of known nodes; the rest is dropped.'
      );
    }
    if (accepted.writes.length === 0) {
      return;
    }
    store.setState((latest) => ({
      ...latest,
      unrecordedState: applyUnrecordedWrites(
        latest.unrecordedState ?? EMPTY_UNRECORDED_STATE,
        accepted.writes
      ),
      rendererStream: appendToRendererStream(
        latest.rendererStream ?? EMPTY_RENDERER_STREAM,
        convertA2uiMessages(accepted.messages)
      ),
    }));
  }

  /**
   * Streams the answer to a component action into the run `target` records. Only an action that
   * opened that turn changes it: its failure fails the turn, and a concurrency conflict also sets
   * `actionError`. Any other action, including one recorded with the initialization, only updates
   * the surfaces, and `actionError` reports its failure (ADR-018, as amended).
   */
  async function streamAction(
    target: RunTarget,
    action: A2uiAction,
    source: ActionSource,
    ownsTurn: boolean,
    abortController: AbortController
  ): Promise<void> {
    setActionError(undefined);
    const failure = await executeStream(
      target,
      () => buildActionRequest(action),
      abortController,
      ownsTurn ? undefined : source
    );
    if (!failure) {
      return;
    }
    if (!ownsTurn || failure.conflict) {
      setActionError({message: failure.error, ...source});
    }
    if (ownsTurn) {
      failRun(target, failure.error);
    }
  }

  /**
   * Recovers the PascalCase `component` discriminant of the dispatching node by
   * routing `(surfaceId, sourceComponentId)` through the session's node-identity
   * registry, derived from the session's activity log (ADR-018): any live surface
   * resolves, whichever run created it. Returns `undefined` when the node
   * resolves to no component.
   */
  function recoverDiscriminant(surfaceId: string, sourceComponentId: string): string | undefined {
    const registry = deriveNodeIdentityRegistry(sessionActivities(store.getState()));
    return registry.get(surfaceId)?.get(sourceComponentId);
  }

  /** Every refusal settles at once, so no caller is left waiting. */
  function issue(message: A2uiClientMessage): Promise<void> {
    const userAction = message.userAction;
    if (!userAction) {
      devWarn('dispatchAction: message carries no userAction; nothing sent.');
      return withhold();
    }

    const {name, surfaceId, sourceComponentId, context} = userAction;
    if (!sourceComponentId) {
      devWarn('dispatchAction: userAction has no sourceComponentId; nothing sent.');
      return withhold();
    }

    const discriminant = recoverDiscriminant(surfaceId, sourceComponentId);
    if (discriminant === undefined) {
      devWarn(
        `dispatchAction: node "${sourceComponentId}" on surface "${surfaceId}" resolves to no component; nothing sent.`
      );
      return withhold();
    }

    return issueAction({discriminant, name, sourceComponentId, surfaceId, context});
  }

  /**
   * The single consumer-facing action-dispatch entry point. See
   * {@link Session.dispatchAction}. Pre-bound arrow field so
   * `onAction={session.dispatchAction}` works when passed by reference.
   *
   * FIRE-AND-FORGET: every refusal is swallowed into a dev-only warning; the
   * returned Promise always resolves.
   */
  const dispatchAction = async (message: A2uiClientMessage | SubmitPromptAction): Promise<void> => {
    if (isSubmitPromptAction(message)) {
      try {
        await startPromptTurn(message.payload.prompt);
      } catch (error) {
        devWarn(`dispatchAction: submitPrompt withheld: ${getErrorMessage(error)}`);
      }
      return;
    }

    await issue(message);
  };

  function retry(turnId: string): void {
    // Re-submit only the last turn, when it errored; any other turnId (unknown, non-error, or an
    // earlier turn, whose answer would land before later turns' surfaces) is a no-op that leaves all
    // turns' statuses unchanged.
    const turn = store.getState().turns.at(-1);
    if (!turn || turn.id !== turnId || turn.status !== 'error') {
      return;
    }
    if (turn.input.action) {
      retryAction(turnId, turn.input.action);
      return;
    }

    // Reset the turn to a fresh streaming turn carrying its original input,
    // then re-drive the stream.
    void sendRequest({kind: 'prompt', turnId}, async (abortController) => {
      replaceTurn(turnId, (previous) => ({
        ...createTurn(previous.id, previous.input),
      }));
      store.setState((current) => ({...current, activeTurnId: turnId}));
      await streamPrompt(turnId, turn.input.prompt ?? '', abortController);
    });
  }

  /**
   * Re-sends the action that opened an errored turn, from the surface it was dispatched from in an
   * earlier turn, and streams its answer into that turn again. The producer accepts an action on
   * any surface of the session, so it is not resolved against the active turn.
   */
  function retryAction(turnId: string, action: TurnAction): void {
    const a2uiAction: A2uiAction = {
      surfaceId: action.surfaceId,
      name: action.name,
      sourceComponentId: action.sourceComponentId,
      timestamp: new Date().toISOString(),
      context: action.context,
    };
    const request: SessionRequest = {
      kind: 'action',
      component: action.component,
      name: action.name,
      surfaceId: action.surfaceId,
      sourceComponentId: action.sourceComponentId,
      turnId,
    };
    void sendRequest(request, async (abortController) => {
      replaceTurn(turnId, (previous) => ({
        ...createTurn(previous.id, previous.input),
      }));
      store.setState((current) => ({...current, activeTurnId: turnId}));
      await streamAction(
        turnTarget(turnId),
        a2uiAction,
        {
          component: action.component,
          name: action.name,
          surfaceId: action.surfaceId,
          sourceComponentId: action.sourceComponentId,
        },
        true,
        abortController
      );
    });
  }

  function serialize(): SerializedSession {
    return serializeSession(store.getState());
  }

  let snapshot: SessionSnapshot | undefined;
  function getSnapshot(): SessionSnapshot {
    const {turns, surfaces} = readSurfaceView();
    const a2uiMessages = (store.getState().rendererStream ?? EMPTY_RENDERER_STREAM).messages;
    const state = readLiveState();
    const {initialization, request, actionError} = store.getState();
    if (
      snapshot === undefined ||
      snapshot.turns !== turns ||
      snapshot.initialization !== initialization ||
      snapshot.surfaces !== surfaces ||
      snapshot.a2uiMessages !== a2uiMessages ||
      snapshot.state !== state ||
      snapshot.request !== request ||
      snapshot.actionError !== actionError
    ) {
      snapshot = Object.freeze({
        turns,
        initialization,
        surfaces,
        a2uiMessages,
        state,
        request,
        actionError,
      });
    }
    return snapshot;
  }

  if (config.initialize !== false && !config.sessionToRestore) {
    queueMicrotask(() => {
      const {sessionToken, request} = store.getState();
      // A prompt dispatched in the same task already opens the session.
      if (!sessionToken && !request) {
        void initialize();
      }
    });
  }

  return {
    contracts: config.contracts,
    get turns() {
      return readSurfaceView().turns;
    },
    get initialization() {
      return store.getState().initialization;
    },
    get surfaces() {
      return readSurfaceView().surfaces;
    },
    get a2uiMessages() {
      return (store.getState().rendererStream ?? EMPTY_RENDERER_STREAM).messages;
    },
    get state() {
      return readLiveState();
    },
    get actionError() {
      return store.getState().actionError;
    },
    get request() {
      return store.getState().request;
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    getSnapshot,
    sendAndWait,
    dispatchAction,
    cancel,
    retry,
    serialize,
  };
}
