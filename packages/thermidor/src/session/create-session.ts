/**
 * Session factory + runtime.
 *
 * `createSession(config)` returns a {@link Session}: the lean client handle for
 * one continuous, token-carrying interaction with the unified converse
 * endpoint.
 *
 * The session owns a plain {@link SessionStore} and drives it with the pure
 * {@link foldActivity} reduction, plus the dispatchAction / cancel / retry /
 * stream-consume orchestration.
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
  CommerceRequestModel,
} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {
  CommerceContextProvider,
  NavigatorContextProvider,
} from '@/src/internal/context/index.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {generateId} from '@/src/internal/utils/id-generator.js';
import {
  type CoalesceIntent,
  createDispatchCoordinator,
  createSettledDispatch,
  type DispatchSnapshot,
  type IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
import {validateActionPayload} from './action-payload-validation.js';
import type {ContractsSchema} from './contracts.js';
import {createTurn, foldActivity} from './fold.js';
import {deriveNodeIdentityRegistry} from './in-transit-validation.js';
import {restoreSession, serializeSession, type SerializedSession} from './serialize.js';
import {createSessionStore, type SessionStore, type SessionStoreState} from './store.js';
import type {Turn, TurnInput} from './types.js';

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
  /** Readonly observable list of turns folded from the streamed response. */
  readonly turns: readonly Turn[];
  /** Registers a listener invoked once per change to the turn list. */
  subscribe(listener: () => void): () => void;
  /**
   * The single consumer-facing action-dispatch entry point, wired directly as
   * the renderer's `onAction` handler (`onAction={session.dispatchAction}`).
   *
   * A {@link SubmitPromptAction} opens a new streaming turn for its prompt and
   * resolves once that turn's stream ends. It preempts gesture dispatches:
   * queued ones are withheld and one in flight is cancelled.
   *
   * An {@link A2uiClientMessage} is unwrapped to its `userAction`: the session
   * recovers the dispatching component's discriminant from the active turn's
   * surfaces, validates the action payload against the component's contract
   * internally, and — on success — POSTs the action to the converse endpoint.
   *
   * FIRE-AND-FORGET: the returned Promise ALWAYS resolves and NEVER rejects, so
   * the consumer needs no `.catch`. A message with no `userAction`, no
   * `sourceComponentId`, a node that resolves to no component, and an internal
   * dispatch rejection (for example an invalid payload) are all dropped with a
   * dev-only warning and nothing is sent.
   */
  dispatchAction: (message: A2uiClientMessage | SubmitPromptAction) => Promise<void>;
  /** Scoped for removal together with `src/actions` once the producer owns the queue. */
  actions: SessionActions;
  /** Stops consuming the active turn's stream. */
  cancel(): void;
  /** Re-submits an errored turn's input. */
  retry(turnId: string): void;
  /** Serializes the session transcript for persistence. */
  serialize(): SerializedSession;
}

function isSubmitPromptAction(
  message: A2uiClientMessage | SubmitPromptAction
): message is SubmitPromptAction {
  return 'name' in message && message.name === 'submitPrompt';
}

export interface SessionActions {
  /** Returns before any send, so local state can be tied to the id synchronously. */
  issue: (message: A2uiClientMessage, intent?: CoalesceIntent) => IssuedDispatch;
  withholdQueued: () => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => DispatchSnapshot;
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
      };

  const store: SessionStore<Turn> = createSessionStore<Turn>(initialState);

  const client = createUnifiedEndpointClient();

  // The currently in-flight stream's abort controller, or null when idle. Held
  // per session instance — never module-level — so two sessions never contend.
  let activeAbortController: AbortController | null = null;

  // Serialized because each response is a whole-node snapshot: overlapping streams would let the
  // last to ARRIVE win over a newer action sent later. Turn id and request are read at send time.
  // `hasStreamingTurn()`, not `isStreaming()`: a prompt may have opened since this was queued, and
  // `isStreaming()` would see this action's own stream.
  const actionCoordinator = createDispatchCoordinator<A2uiAction>((action) => {
    const turnId = store.getState().activeTurnId;
    if (!turnId || hasStreamingTurn()) {
      return;
    }
    return executeStream(turnId, () => buildActionRequest(action));
  });

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

  function failTurn(turnId: string, error: string): void {
    replaceTurn(turnId, (turn) => ({...turn, status: 'error', error}));
  }

  /** True while any turn is streaming. Gesture streams reuse a complete turn, so don't count. */
  function hasStreamingTurn(): boolean {
    return store.getState().turns.some((turn) => turn.status === 'streaming');
  }

  /** True while any stream, prompt or gesture, is in flight. */
  function isStreaming(): boolean {
    return activeAbortController !== null;
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

  function buildActionRequest(action: A2uiAction): CommerceRequestModel {
    return {...buildBaseRequest(), message: null, action};
  }

  async function consumeStream(
    turnId: string,
    stream: ReadableStream<Uint8Array>,
    abortController: AbortController
  ): Promise<void> {
    let terminalEventReceived = false;

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

        replaceTurn(turnId, (turn) => foldActivity(turn, event, config.contracts));

        const foldedStatus = store.getState().turns.find((turn) => turn.id === turnId)?.status;
        if (foldedStatus === 'complete' || foldedStatus === 'error') {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        // A stream superseded by a newer one must not touch the turn; the newer
        // stream owns the outcome.
        if (!terminalEventReceived && !isSuperseded(activeAbortController, abortController)) {
          failTurn(turnId, 'Stream ended without a terminal event.');
        }
      },
      onError: (error) => {
        if (terminalEventReceived || isSuperseded(activeAbortController, abortController)) {
          return;
        }
        if (isAbortError(error)) {
          failTurn(turnId, 'Cancelled');
        } else {
          failTurn(turnId, getErrorMessage(error));
        }
      },
    });
  }

  /** Takes a builder so a throwing context provider fails the turn inside the `try`. */
  async function executeStream(
    turnId: string,
    buildRequest: () => CommerceRequestModel
  ): Promise<void> {
    const abortController = new AbortController();
    activeAbortController = abortController;

    try {
      const result = await client.call(
        buildRequest(),
        {
          organizationId: config.organizationId,
          accessToken: config.accessToken,
          endpoint: config.endpoint,
        },
        {signal: abortController.signal}
      );

      if (!result.success) {
        failTurn(turnId, result.error);
        return;
      }

      await consumeStream(turnId, result.data.stream, abortController);
    } catch (error) {
      // A stream aborted because a NEWER stream superseded it must not touch the
      // turn: the newer stream owns the outcome. A plain cancel (controller reset
      // to null) still reports the failure.
      if (isSuperseded(activeAbortController, abortController)) {
        return;
      }
      if (isAbortError(error)) {
        failTurn(turnId, 'Cancelled');
        return;
      }
      failTurn(turnId, getErrorMessage(error));
    } finally {
      if (activeAbortController === abortController) {
        activeAbortController = null;
      }
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
   * Stops consuming the in-flight stream, retaining whatever partial
   * {@link TurnResponse} has already been folded, and marks the active turn
   * `error`. When nothing is in flight, it is a no-op that
   * leaves every turn unchanged.
   */
  function cancel(): void {
    if (!activeAbortController) {
      return;
    }

    activeAbortController.abort();
    activeAbortController = null;

    // Mark the active turn `error` synchronously, preserving the partial
    // response already folded. The abort races the stream reader, so the turn
    // is committed here rather than relying on the reader's error path.
    const {activeTurnId} = store.getState();
    if (activeTurnId) {
      replaceTurn(activeTurnId, (turn) =>
        turn.status === 'streaming' ? {...turn, status: 'error', error: 'Cancelled'} : turn
      );
    }
  }

  /**
   * Opens a new turn for `prompt` and streams its response, preempting any gestures. Needs no
   * active turn, so it also opens the first turn of a session.
   */
  async function startPromptTurn(prompt: string | undefined): Promise<void> {
    // The prompt rebuilds the state the gestures were refining, so it preempts rather than waits.
    actionCoordinator.withholdQueued();
    if (isStreaming()) {
      cancel();
      actionCoordinator.cancelInFlight();
    }

    const turnId = generateId();
    openTurn(turnId, {prompt});

    await executeStream(turnId, () => buildConversationRequest(prompt ?? ''));
  }

  /**
   * Private validate-and-queue path. Validates the recovered action's payload against the
   * component's generated Zod action schema and withholds on failure; targets the action's own
   * originating surface. Withholds while a turn is streaming or when there is no active turn.
   */
  function issueAction(
    recovered: {
      discriminant: string;
      name: string;
      sourceComponentId: string;
      surfaceId: string;
      context: unknown;
    },
    intent?: CoalesceIntent
  ): IssuedDispatch {
    // `hasStreamingTurn()`, not `isStreaming()`: an in-flight gesture must not block another.
    if (hasStreamingTurn()) {
      return createSettledDispatch('withheld');
    }

    const {activeTurnId} = store.getState();
    if (!activeTurnId) {
      return createSettledDispatch('withheld');
    }

    // `recovered.surfaceId` is already validated upstream by `recoverDiscriminant`
    // (it resolves a discriminant only for a `(surfaceId, sourceComponentId)` in
    // the active turn's registry), so the origin surface is used as-is — no
    // re-check, and a conversation-only surface reaches itself, not a commerce one.
    const surfaceId = recovered.surfaceId;

    // Validate the action payload against the component's generated Zod action
    // schema BEFORE the POST. A non-conforming payload is withheld (nothing sent).
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
      return createSettledDispatch('withheld');
    }

    const a2uiAction: A2uiAction = {
      surfaceId,
      name: recovered.name,
      sourceComponentId: recovered.sourceComponentId,
      timestamp: new Date().toISOString(),
      // `actionId` only correlates an `actionResponse`, which isn't implemented; completion comes
      // from the response body closing instead.
      actionId: null,
      wantResponse: false,
      context: recovered.context,
    };

    return actionCoordinator.issue(a2uiAction, intent);
  }

  /**
   * Recovers the PascalCase `component` discriminant of the dispatching node by
   * routing `(surfaceId, sourceComponentId)` through the active turn's
   * node-identity registry (derived from its surfaces). Returns `undefined`
   * when there is no active turn or the node resolves to no component.
   */
  function recoverDiscriminant(surfaceId: string, sourceComponentId: string): string | undefined {
    const {turns, activeTurnId} = store.getState();
    if (!activeTurnId) {
      return undefined;
    }
    const activeTurn = turns.find((turn) => turn.id === activeTurnId);
    if (!activeTurn) {
      return undefined;
    }
    const registry = deriveNodeIdentityRegistry(activeTurn.response.activities);
    return registry.get(surfaceId)?.get(sourceComponentId);
  }

  /** Every refusal returns an already-settled 'withheld' dispatch, so no caller is left waiting. */
  function issue(message: A2uiClientMessage, intent?: CoalesceIntent): IssuedDispatch {
    const userAction = message.userAction;
    if (!userAction) {
      devWarn('dispatchAction: message carries no userAction; nothing sent.');
      return createSettledDispatch('withheld');
    }

    const {name, surfaceId, sourceComponentId, context} = userAction;
    if (!sourceComponentId) {
      devWarn('dispatchAction: userAction has no sourceComponentId; nothing sent.');
      return createSettledDispatch('withheld');
    }

    const discriminant = recoverDiscriminant(surfaceId, sourceComponentId);
    if (discriminant === undefined) {
      devWarn(
        `dispatchAction: node "${sourceComponentId}" on surface "${surfaceId}" resolves to no component; nothing sent.`
      );
      return createSettledDispatch('withheld');
    }

    return issueAction({discriminant, name, sourceComponentId, surfaceId, context}, intent);
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

    await issue(message).settled;
  };

  function retry(turnId: string): void {
    // Re-submit only an `error` turn; any other turnId (unknown or non-error)
    // is a no-op that leaves all turns' statuses unchanged.
    const turn = store.getState().turns.find((candidate) => candidate.id === turnId);
    if (!turn || turn.status !== 'error') {
      return;
    }

    // Reset the turn to a fresh streaming turn carrying its original input,
    // then re-drive the stream.
    replaceTurn(turnId, (previous) => ({
      ...createTurn(previous.id, previous.input),
    }));
    store.setState((current) => ({...current, activeTurnId: turnId}));

    void executeStream(turnId, () => buildConversationRequest(turn.input.prompt ?? ''));
  }

  function serialize(): SerializedSession {
    return serializeSession(store.getState());
  }

  return {
    contracts: config.contracts,
    get turns() {
      return store.getState().turns;
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    dispatchAction,
    actions: {
      issue,
      withholdQueued: actionCoordinator.withholdQueued,
      subscribe: actionCoordinator.subscribe,
      getSnapshot: actionCoordinator.getSnapshot,
    },
    cancel,
    retry,
    serialize,
  };
}
