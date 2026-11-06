/**
 * The canonical runtime domain model for the session client, and the {@link Session} handle and
 * configuration that expose it.
 *
 * `state` and `activities` are routing-neutral and live at the top of
 * `response`; only `messages` and `reasoningSteps` are agent-specific and move
 * under the optional `agent` facet, whose presence signals "the router invoked
 * an agent".
 */

import type {
  CommerceContextProvider,
  NavigatorContextProvider,
} from '@/src/internal/context/index.js';
import type {ContractsSchema} from './contracts.js';
import type {SerializedSession} from './serialize.js';

/**
 * The lifecycle status of a {@link Turn}.
 */
export type TurnStatus = 'streaming' | 'complete' | 'error';

/**
 * The server-authoritative UI state of the session, keyed BY SURFACE: each live
 * surface owns its own data model at `state[surfaceId]`, into which validated
 * `updateDataModel` ops are applied at their `/state/<nodeId>` pointer, whichever
 * turn carried them. Keying by surface keeps two surfaces that share a
 * node id (every surface has a `root`) from colliding.
 */
export type A2uiState = Record<string, unknown>;

/**
 * A discovered renderable region derived from `activities`, exposed as the
 * session's live surfaces and as each turn's {@link TurnResponse.surfaces}
 * (interim). Each entry carries a non-empty `surfaceId` and a non-empty
 * `rootComponentType`. A surface lives from its `createSurface` until its
 * `deleteSurface`, whichever runs carry them; a deleted surface leaves
 * the lists, and so does a loading placeholder its turn left behind once it
 * stopped streaming.
 */
export interface DiscoveredSurface {
  surfaceId: string;
  /**
   * The root node's PascalCase `component` discriminant; interim: compared
   * against `'CommerceSearch'` by consumers/nav.
   */
  rootComponentType: string;
  /**
   * Whether the surface is a loading placeholder: its data model declares
   * `isLoading: true` (the commerce catalog flag). A consumer renders a
   * placeholder for `rootComponentType` while this holds. It ends when the
   * agent deletes the surface (the surface leaves this list) or writes
   * `isLoading: false` to its data model. A placeholder is listed only while the
   * run that created it streams; one the agent left behind (a cancelled run, an
   * error, a restored session) leaves the lists, and a later request streaming
   * into its turn does not bring it back.
   */
  isLoading: boolean;
}

/**
 * A single A2-UI message in the **v0.9** shape a renderer consumes, exposed in
 * the session's renderer stream (`Session.a2uiMessages`).
 *
 * Agent Gateway emits A2-UI v1.0; every available renderer
 * (`@copilotkit/a2ui-renderer`, via `@a2ui/web_core/v0_9`) consumes v0.9. This
 * projection performs that downgrade so a consumer can hand the stream straight
 * to a renderer without writing version-aware code of their own.
 *
 * INTERIM: this is recorded debt, removed in a breaking change
 * once a v1.0-capable renderer exists. Kept deliberately untyped beyond
 * "record" — the per-operation shapes belong to the renderer's protocol, not to
 * thermidor's domain model, and pinning them here would deepen the coupling this
 * projection is meant to contain.
 */
export type A2uiV09Message = Record<string, unknown>;

/**
 * A single step in the agent's reasoning process — either a reasoning message
 * or a tool-call invocation. The array order in
 * {@link TurnAgent.reasoningSteps} reflects the chronological order of events
 * received from the stream.
 */
export type ReasoningStep = ReasoningMessageStep | ToolCallStep;

export interface ReasoningMessageStep {
  type: 'reasoning';

  /**
   * The accumulated reasoning/thinking text for this step.
   */
  content: string;
}

export type ToolCallStatus = 'calling' | 'completed';

export interface ToolCallStep {
  type: 'tool-call';

  /**
   * The server-assigned tool call identifier.
   */
  id: string;

  /**
   * The name of the tool being invoked.
   */
  name: string;

  /**
   * The accumulated arguments (JSON string) passed to the tool.
   */
  args: string;

  /**
   * The tool result content, available once the call completes.
   */
  result?: string;

  /**
   * The lifecycle status of this tool call.
   */
  status: ToolCallStatus;
}

export interface AgentMessage {
  /**
   * The text content of the message.
   */
  content: string;

  /**
   * The origin role of the message.
   */
  role: string;
}

/**
 * Represents a single activity emitted during a turn's streamed response.
 */
export interface Activity {
  id: string;
  kind: string;
  replace: boolean;
  payload: Record<string, unknown>;
  /**
   * The AG-UI `metadata` of the event that carried the activity, when it had one. A producer
   * announces the turn-opening actions of a surface under its `turnOpeningActions` key, and its
   * concurrent actions, with their cache policy, under `concurrentActions`.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Agent-specific content, present only when the router invoked an agent for the
 * turn. Kept separate from the routing-neutral {@link TurnResponse} fields.
 */
export interface TurnAgent {
  messages: AgentMessage[];
  reasoningSteps: ReasoningStep[];
}

/**
 * A request the session is sending: the `initialize` that opens the session, a prompt that streams
 * a turn, or a component action (a follow-up included).
 */
export type SessionRequest = InitializeRequest | PromptRequest | ActionRequest;

/** The `initialize` action the session sends to open itself, recorded as `Session.initialization`. */
export interface InitializeRequest {
  kind: 'initialize';
}

/** A prompt the session is sending, streaming into a new turn or a retried one. */
export interface PromptRequest {
  kind: 'prompt';
  /** The turn the prompt streams into. */
  turnId: string;
}

/** A component action the session is sending. */
export interface ActionRequest {
  kind: 'action';
  /** The `component` discriminant of the dispatching node. */
  component: string;
  /** The action name declared by the dispatching component's contract. */
  name: string;
  /** The A2-UI surface the action originated on. */
  surfaceId: string;
  /** The id of the node that dispatched the action. */
  sourceComponentId: string;
  /**
   * The turn the action's response streams into: the turn it opens, or the active turn. Absent
   * before the first turn, when the response is recorded with `Session.initialization`.
   */
  turnId?: string;
}

/**
 * Why a component action failed, and the action it came from, so a consumer can show the failure
 * next to the block that dispatched it.
 */
export interface ActionError {
  /** Why the action failed. */
  message: string;
  /** The PascalCase `component` discriminant of the node that dispatched the action. */
  component: string;
  /** The action name declared by the dispatching component's contract. */
  name: string;
  /** The A2-UI surface the action originated on. */
  surfaceId: string;
  /** The id of the node that dispatched the action. */
  sourceComponentId: string;
}

/**
 * The input paired with a turn's streamed response.
 *
 * A prompt turn carries `prompt`. A turn opened by a component action the producer announces as
 * opening a turn, such as a follow-up chip, carries `action` instead.
 */
export interface TurnInput {
  /** The prompt the turn answers, for a turn a prompt opened. */
  prompt?: string;
  /** The component action the turn answers, for a turn an action opened. */
  action?: TurnAction;
}

/** A component action that opened a turn, as it was dispatched. */
export interface TurnAction {
  /** The PascalCase `component` discriminant of the node that dispatched it. */
  component: string;
  /** The action name declared by that component's contract. */
  name: string;
  /**
   * The id of the surface it was dispatched from, which an earlier turn or the initialization
   * created.
   */
  surfaceId: string;
  /** The id of the node that dispatched it. */
  sourceComponentId: string;
  /** Its payload, as validated against the action's contract. */
  context?: unknown;
}

/**
 * The streamed result of a {@link Turn}.
 *
 * `activities` is routing-neutral and always present. `surfaces` is a derived
 * projection of the session's activities (interim). `agent` is present
 * only when the router invoked an agent. The session's renderer stream and
 * component state span every turn, so they live on the session.
 */
export interface TurnResponse {
  /**
   * The turn's snapshot activities in first-seen order. Always present. A
   * `replace` snapshot supersedes the earlier activity with the same
   * `messageId` in place rather than appending a duplicate, so this holds the
   * latest snapshot per `messageId`. Together with the other turns', in order,
   * they form the session's activity log.
   */
  activities: Activity[];

  /**
   * The live surfaces this turn created, in creation order, so a transcript
   * knows where to draw them. Consumers read this instead of walking
   * `activities` themselves. A surface a later run deletes leaves the list, and
   * one a later turn creates again under the same id belongs to that turn.
   */
  surfaces: DiscoveredSurface[];

  /**
   * Agent-specific content. Present ONLY when the router invoked an agent.
   */
  agent?: TurnAgent;
}

/**
 * The run of the `initialize` action that opens a session, exposed as `Session.initialization`.
 * Not a turn: it never appears in `Session.turns`.
 */
export interface SessionInitialization {
  /**
   * The run's snapshot activities in first-seen order, merged by `messageId` as in
   * {@link TurnResponse.activities}. They come first in the session's activity log. The surface
   * snapshots of a component action dispatched before the first turn are recorded here too.
   */
  activities: Activity[];
  /** `'streaming'` while `initialize` is in flight, then `'complete'` or `'error'`. */
  status: TurnStatus;
  /** Why `initialize` failed. Present when `status === 'error'`, absent otherwise. */
  error?: string;
}

/**
 * One `input` paired with its streamed `response`.
 */
export interface Turn {
  id: string;
  input: TurnInput;
  response: TurnResponse;
  status: TurnStatus;
  /** Present when `status === 'error'`, absent otherwise. */
  error?: string;
}

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
  /** The identifier of the configured agent that answers the session. Sent with every request. */
  agentConfigurationId: string;
  /** The tracking identifier of the experience. Sent with every request. */
  trackingId: string;
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
   * Sends a user interaction. Wire it directly as the renderer's `onAction` handler
   * (`onAction={session.dispatchAction}`).
   *
   * The session sends one request at a time: a dispatch made while another request is in flight
   * is withheld, a prompt included. The returned Promise resolves once the dispatch's own request
   * ends.
   *
   * A {@link SubmitPromptAction} opens a new streaming turn for its prompt, and resolves once that
   * turn's stream ends.
   *
   * An {@link A2uiClientMessage} sends its `userAction` from the surface it was dispatched on,
   * whichever turn created it. An action the producer announces as opening a turn, such as a
   * follow-up chip, opens a new streaming turn whose `input.action` records it, as a prompt does,
   * and resolves once that turn's stream ends. It needs no active turn, so it may open the first
   * turn of a session. Any other action only updates the surfaces: its surface snapshots are
   * recorded with the active turn, or with {@link Session.initialization} before the first turn,
   * and its failure sets {@link Session.actionError}.
   *
   * An action the producer announces as concurrent is sent at once, whatever request is in flight,
   * and never sets {@link Session.request}. Only the latest dispatch from a node is shown, and one
   * the producer allows to be reused is answered without a request. Its answer is not recorded, and
   * its failure sets no {@link Session.actionError}.
   *
   * The returned Promise always resolves and never rejects, so the consumer needs no `.catch`. A
   * message with no `userAction` or no `sourceComponentId`, one from a node that is not a
   * component of a live surface, and one whose payload does not match the action's contract are
   * dropped with a dev-only warning, and nothing is sent. An action that opens no turn is dropped
   * too while the session has neither an active turn nor an initialization.
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

/** The session configuration minus the fields that scope every request. */
export type SessionRuntimeConfig<TContracts extends ContractsSchema = ContractsSchema> = Omit<
  SessionConfig<TContracts>,
  'agentConfigurationId' | 'trackingId'
>;
