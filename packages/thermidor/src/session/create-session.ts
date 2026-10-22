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
import {validateActionPayload} from './action-payload-validation.js';
import type {SessionContract} from './contracts.js';
import {callWithConflictRetry} from './conflict-retry.js';
import {createTurn, foldActivity} from './fold.js';
import {deriveNodeIdentityRegistry} from './in-transit-validation.js';
import {restoreSession, serializeSession, type SerializedSession} from './serialize.js';
import {createSessionStore, type SessionStore, type SessionStoreState} from './store.js';
import type {SessionRequest, Turn, TurnInput} from './types.js';
import {
  createSurfaceInstances,
  type SurfaceInstance,
  type SurfaceInstanceOptions,
} from './surface-instances.js';

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
export interface SessionConfig<TContract extends SessionContract = SessionContract> {
  /**
   * The injected contract, as one value, such as `ThermidorContract` from
   * `@coveo/thermidor-schema`:
   *
   * - `components`: the conversational component union (a discriminated union on `component`,
   *   each member carrying that component's `state` and `actions`). It is the SOLE validation
   *   source for the surfaces the producer creates: inbound `updateDataModel` ops are validated
   *   against the member's `state` (whole) / its sub-schema (partial sub-path), and outbound
   *   action payloads against the member's `actions` for the dispatched action name, before the
   *   POST.
   * - `surfaceTemplates`: the templates {@link Session.instantiateSurface} creates instances
   *   of, each with its own `catalogId` and `componentContracts`, the union an instance is
   *   validated against.
   * - `lookupActions`: the actions of each component that are lookups.
   * - `surfaceInstanceIdPrefix`: the prefix every instance's surface id starts with.
   *
   * Injecting it here keeps `@coveo/thermidor` decoupled from any concrete contract package, so
   * the runtime works with any A2-UI contract of this shape.
   */
  contract: TContract;
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
export interface Session<TContract extends SessionContract = SessionContract> {
  /**
   * The injected contract this session validates against and instantiates surface templates from.
   * Retained on the handle so the generic parameter is observable and the runtime threads the
   * exact contract that was injected.
   */
  readonly contract: TContract;
  /** Readonly observable list of turns folded from the streamed response. */
  readonly turns: readonly Turn[];
  /**
   * Why the last component action was dropped, or `undefined`. Set when the endpoint kept
   * rejecting the action because another one was still being processed for this session, after
   * the session's own bounded retries ran out. That action's dispatch settles `'failed'`, so any
   * optimistic state tied to it is released and the last authoritative state shows again.
   * Cleared once the next action or prompt is sent. Changes notify {@link Session.subscribe}
   * listeners. A conflict that recovers through retry never sets it.
   */
  readonly actionError: string | undefined;
  /**
   * The request the session is sending, or `undefined` when it is idle. The session sends one
   * request at a time, prompts and actions alike, in the order they were dispatched; an action's
   * run counts, a follow-up included. A lookup from a surface instance is not one of them: it is
   * sent at once and never sets it. Read it synchronously, or through {@link Session.subscribe}.
   */
  readonly request: SessionRequest | undefined;
  /**
   * Creates an instance of one of the contract's surface templates, outside any turn, so a
   * renderer can draw it before any request: its `messages` already hold its creation.
   * Call it where the application draws the surface, and dispose of the instance when it stops
   * drawing it.
   *
   * The instance's actions go through {@link Session.dispatchAction}. Each one the contract marks
   * as a lookup is sent at once, alongside any prompt or gesture, with the template name, and its
   * result is appended to the instance's `messages`.
   *
   * @param template - The name of a template the contract declares.
   * @param options - The instance's surface id, if the application chooses it. It must start with
   *   the contract's `surfaceInstanceIdPrefix`; a minted one does, such as `template:search-box-1`.
   * @throws When the contract declares no such template, when the surface id does not start with
   *   the contract's `surfaceInstanceIdPrefix`, or when a live instance already holds it.
   */
  instantiateSurface(
    template: TContract['surfaceTemplates'][number]['template'],
    options?: SurfaceInstanceOptions
  ): SurfaceInstance;
  /**
   * Registers a listener invoked once per change to the turn list, `actionError`, `request`, or
   * the `messages` of a surface instance.
   */
  subscribe(listener: () => void): () => void;
  /**
   * Calls `send`, which dispatches through the renderer, and resolves once the session has answered
   * that dispatch, whatever the outcome: answered, failed, cancelled, or withheld without being
   * sent: it waits for {@link Session.request} to be `undefined`, right away when the dispatch was
   * withheld, otherwise once its request ends. For example, it ends an optimistic update. A
   * renderer's own dispatch promise may resolve as soon as it has emitted the action, before the
   * session has answered it; when the {@link Session.dispatchAction} promise is at hand, await it
   * instead. A lookup never sets `request`, so this does not wait for one: await its
   * `dispatchAction` promise instead.
   */
  sendAndWait(send: () => unknown): Promise<void>;
  /**
   * The single consumer-facing action-dispatch entry point, wired directly as
   * the renderer's `onAction` handler (`onAction={session.dispatchAction}`).
   *
   * The session sends one request at a time: a dispatch made while another request is in flight
   * is withheld, a prompt included. The returned Promise resolves once the dispatch's own request
   * ends. A lookup is exempt, as described below.
   *
   * A {@link SubmitPromptAction} opens a new streaming turn for its prompt, and resolves once that
   * turn's stream ends.
   *
   * An {@link A2uiClientMessage} is unwrapped to its `userAction`: the session
   * recovers the dispatching component's discriminant from the active turn's
   * surfaces, validates the action payload against the component's contract
   * internally, and — on success — POSTs the action to the converse endpoint.
   *
   * An action from a live surface instance (see {@link Session.instantiateSurface}) needs no
   * active turn. It must be one the contract marks as a lookup, and is sent at once, even while a
   * request is in flight, with the session token when there is one and the instance's template
   * name. It is never withheld, never withholds another dispatch, and never sets
   * {@link Session.request}. A newer lookup from the same surface, component and action aborts the
   * previous one. Its result is appended to that instance's `messages`: it never opens a turn or
   * folds into one, no session keys are adopted from it, and its failure fails no turn. It
   * resolves once the lookup's run ends: answered, failed, superseded by a newer lookup, or
   * aborted when its instance is disposed of.
   *
   * FIRE-AND-FORGET: the returned Promise ALWAYS resolves and NEVER rejects, so
   * the consumer needs no `.catch`. A message with no `userAction`, no
   * `sourceComponentId`, a node that resolves to no component, an action from a
   * surface instance that is not a lookup, and an internal dispatch rejection
   * (for example an invalid payload) are all dropped with a dev-only warning and
   * nothing is sent.
   */
  dispatchAction: (message: A2uiClientMessage | SubmitPromptAction) => Promise<void>;
  /**
   * Stops the request in flight. {@link Session.request} stays set until the stopped request has
   * unwound, a few microtasks later, so a dispatch made right after `cancel()` is withheld: wait for
   * `request` to become `undefined`, through {@link Session.subscribe}, before sending the next one.
   */
  cancel(): void;
  /** Re-submits an errored turn's input; withheld like any dispatch while a request is in flight. */
  retry(turnId: string): void;
  /** Serializes the session transcript for persistence. */
  serialize(): SerializedSession;
}

function isSubmitPromptAction(
  message: A2uiClientMessage | SubmitPromptAction
): message is SubmitPromptAction {
  return 'name' in message && message.name === 'submitPrompt';
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
export function createSession<TContract extends SessionContract>(
  config: SessionConfig<TContract>
): Session<TContract> {
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

  const contracts = config.contract.components;
  const lookupActions = config.contract.lookupActions;

  // Per surface, one in-flight lookup per source component and action; a newer one aborts it.
  const lookupControllers = new Map<string, Map<string, AbortController>>();
  const surfaceInstances = createSurfaceInstances(
    config.contract.surfaceTemplates,
    config.contract.surfaceInstanceIdPrefix,
    {
      onChange: () => store.setState((current) => ({...current})),
      onDispose: (surfaceId) => {
        for (const controller of lookupControllers.get(surfaceId)?.values() ?? []) {
          controller.abort();
        }
        lookupControllers.delete(surfaceId);
      },
    }
  );

  // The currently in-flight stream's abort controller, or null when idle. Held
  // per session instance — never module-level — so two sessions never contend.
  let activeAbortController: AbortController | null = null;

  // One request at a time: the endpoint handles a single request per session, and each response
  // is a whole-node snapshot, so overlapping streams would let the last to ARRIVE win over a newer
  // action sent later. A dispatch made while a request is in flight is withheld.
  async function sendRequest(
    request: SessionRequest,
    send: (abortController: AbortController) => Promise<void>
  ): Promise<void> {
    if (store.getState().request) {
      devWarn('dispatchAction: withheld: another request is in flight.');
      return withhold();
    }
    // Armed before it is published, so a listener's `cancel()` stops the request it was told about.
    const abortController = new AbortController();
    activeAbortController = abortController;
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

  function setActionError(actionError: string | undefined): void {
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

  function failTurn(turnId: string, error: string): void {
    replaceTurn(turnId, (turn) => ({...turn, status: 'error', error}));
  }

  // An action streams into a turn that is already complete; cancelling it must leave that turn be.
  function cancelTurn(turnId: string): void {
    replaceTurn(turnId, (turn) =>
      turn.status === 'streaming' ? {...turn, status: 'error', error: 'Cancelled'} : turn
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

        replaceTurn(turnId, (turn) => foldActivity(turn, event, contracts));

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
          cancelTurn(turnId);
        } else {
          failTurn(turnId, getErrorMessage(error));
        }
      },
    });
  }

  /**
   * Takes a builder so a throwing context provider fails the turn inside the `try`. A request the
   * endpoint rejected before streaming is returned for the caller to report; anything later is
   * folded into the turn here.
   */
  async function executeStream(
    turnId: string,
    buildRequest: () => CommerceRequestModel,
    abortController: AbortController
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
            cancelTurn(turnId);
          }
          return undefined;
        }
        return {error: result.error, conflict: result.conflict !== undefined};
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
        cancelTurn(turnId);
        return;
      }
      failTurn(turnId, getErrorMessage(error));
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
    const failure = await executeStream(
      turnId,
      () => buildConversationRequest(prompt),
      abortController
    );
    if (failure) {
      failTurn(turnId, failure.error);
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
   * Stops consuming the in-flight stream. A streaming prompt turn is marked `error`, retaining
   * whatever partial {@link TurnResponse} has already been folded; an action in flight leaves its
   * turn unchanged. `request` is cleared once the stopped request has unwound, not here. When
   * nothing is in flight, it is a no-op that leaves every turn unchanged.
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
      cancelTurn(activeTurnId);
    }
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
   * Private validate-and-send path. Validates the recovered action's payload against the
   * component's generated Zod action schema and withholds on failure; targets the action's own
   * originating surface. Withholds when there is no active turn.
   */
  function issueAction(recovered: {
    discriminant: string;
    name: string;
    sourceComponentId: string;
    surfaceId: string;
    context: unknown;
  }): Promise<void> {
    const {activeTurnId} = store.getState();
    if (!activeTurnId) {
      return withhold();
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
      contracts
    );
    if (!validation.valid) {
      devWarn(
        `dispatchAction: dispatch withheld: Invalid payload for action "${recovered.name}" on component "${recovered.discriminant}": ${validation.reason}`
      );
      return withhold();
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

    const request: SessionRequest = {
      kind: 'action',
      name: recovered.name,
      surfaceId,
      sourceComponentId: recovered.sourceComponentId,
      turnId: activeTurnId,
    };
    return sendRequest(request, async (abortController) => {
      setActionError(undefined);
      const failure = await executeStream(
        activeTurnId,
        () => buildActionRequest(a2uiAction),
        abortController
      );
      if (failure?.conflict) {
        setActionError(failure.error);
        return;
      }
      if (failure) {
        failTurn(activeTurnId, failure.error);
      }
    });
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
   * Resolves an action from a surface instance against its template, and sends it as
   * a lookup. Anything else on the instance is dropped: the contract only places lookups there.
   */
  async function dispatchLookup(
    userAction: NonNullable<A2uiClientMessage['userAction']>
  ): Promise<void> {
    const {name, surfaceId, sourceComponentId, context} = userAction;
    const surfaceTemplate = surfaceInstances.templateOf(surfaceId);
    const componentContracts = surfaceInstances.componentContractsOf(surfaceId);
    const discriminant =
      sourceComponentId === undefined
        ? undefined
        : surfaceInstances.resolve(surfaceId, sourceComponentId);
    if (
      surfaceTemplate === undefined ||
      componentContracts === undefined ||
      sourceComponentId === undefined ||
      !discriminant
    ) {
      devWarn(
        `dispatchAction: node "${sourceComponentId}" on surface "${surfaceId}" resolves to no component; nothing sent.`
      );
      return;
    }
    if (!lookupActions[discriminant]?.includes(name)) {
      devWarn(
        `dispatchAction: "${name}" on component "${discriminant}" is not a lookup, and a surface instance only sends lookups; nothing sent.`
      );
      return;
    }
    const validation = validateActionPayload(discriminant, name, context, componentContracts);
    if (!validation.valid) {
      devWarn(
        `dispatchAction: lookup withheld: Invalid payload for action "${name}" on component "${discriminant}": ${validation.reason}`
      );
      return;
    }

    await runLookup(surfaceTemplate, {
      surfaceId,
      name,
      sourceComponentId,
      timestamp: new Date().toISOString(),
      actionId: null,
      wantResponse: false,
      context,
    });
  }

  /**
   * Sends a lookup outside the prompt and gesture lane. Its run writes only to live surface
   * instances: it never touches a turn, and its session keys are never adopted, so a
   * lookup sent before the first prompt opens no session.
   */
  async function runLookup(
    surfaceTemplate: string,
    action: A2uiAction & {surfaceId: string}
  ): Promise<void> {
    const key = `${action.sourceComponentId}\u0000${action.name}`;
    const surfaceLookups =
      lookupControllers.get(action.surfaceId) ?? new Map<string, AbortController>();
    lookupControllers.set(action.surfaceId, surfaceLookups);
    surfaceLookups.get(key)?.abort();
    const controller = new AbortController();
    surfaceLookups.set(key, controller);

    const reportFailure = (error: unknown) => {
      if (!controller.signal.aborted && !isAbortError(error)) {
        devWarn(`dispatchAction: lookup "${action.name}" failed: ${getErrorMessage(error)}`);
      }
    };

    try {
      const result = await client.call(
        {...buildActionRequest(action), surfaceTemplate},
        {
          organizationId: config.organizationId,
          accessToken: config.accessToken,
          endpoint: config.endpoint,
        },
        {signal: controller.signal}
      );
      if (!result.success) {
        reportFailure(result.error);
        return;
      }
      await readEventStream({
        stream: result.data.stream,
        signal: controller.signal,
        onEvent: (rawEvent) => {
          if (controller.signal.aborted) {
            return;
          }
          const event = parseSSEEvent(rawEvent) as unknown as {
            type: string;
            content?: {messages?: unknown};
          };
          if (event.type === 'ACTIVITY_SNAPSHOT' && Array.isArray(event.content?.messages)) {
            surfaceInstances.apply(event.content.messages);
          }
        },
      });
    } catch (error) {
      reportFailure(error);
    } finally {
      if (surfaceLookups.get(key) === controller) {
        surfaceLookups.delete(key);
      }
    }
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

    if (message.userAction && surfaceInstances.templateOf(message.userAction.surfaceId)) {
      await dispatchLookup(message.userAction);
      return;
    }

    await issue(message);
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
    void sendRequest({kind: 'prompt', turnId}, async (abortController) => {
      replaceTurn(turnId, (previous) => ({
        ...createTurn(previous.id, previous.input),
      }));
      store.setState((current) => ({...current, activeTurnId: turnId}));
      await streamPrompt(turnId, turn.input.prompt ?? '', abortController);
    });
  }

  function serialize(): SerializedSession {
    return serializeSession(store.getState());
  }

  return {
    contract: config.contract,
    get turns() {
      return store.getState().turns;
    },
    get actionError() {
      return store.getState().actionError;
    },
    get request() {
      return store.getState().request;
    },
    instantiateSurface: surfaceInstances.create,
    subscribe(listener) {
      return store.subscribe(listener);
    },
    sendAndWait,
    dispatchAction,
    cancel,
    retry,
    serialize,
  };
}
