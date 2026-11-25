/**
 * The canonical runtime domain model for the session client.
 *
 * `state` and `activities` are routing-neutral and live at the top of
 * `response`; only `messages` and `toolCalls` are agent-specific and move
 * under the optional `agent` facet, whose presence signals "the router invoked
 * an agent".
 */

/**
 * The lifecycle status of a {@link Turn}, or of the {@link SessionInitialization}.
 *
 * @group Turns
 */
export type TurnStatus = 'streaming' | 'complete' | 'error';

/**
 * Why a {@link Turn} or the {@link SessionInitialization} ended in `'error'`.
 *
 * - `'cancelled'`: {@link Session.cancel} stopped it while it streamed.
 * - `'failed'`: the endpoint sent `RUN_ERROR`, the request or stream failed, or the stream ended
 *   without a terminal event, including a run restored while it was streaming.
 *
 * @group Turns
 */
export type TurnErrorReason = 'cancelled' | 'failed';

/**
 * The session's UI state as the endpoint last set it, keyed by surface id.
 *
 * @remarks
 * - Each live surface owns its data model at `state[surfaceId]`.
 * - Validated `updateDataModel` operations apply there at their `/state/<nodeId>` path,
 *   whichever turn carried them.
 * - Keying by surface keeps two surfaces that share a node id, such as `root`, from colliding.
 *
 * @group Surfaces
 */
export type A2uiState = Record<string, unknown>;

// The turn-level surface list is derived from activities; the session-level list is the source of
// truth.
/**
 * A live A2-UI surface: a region to render, listed in {@link Session.surfaces} and in the
 * {@link TurnResponse.surfaces} of the turn that created it.
 *
 * @remarks
 * - A surface lives from its `createSurface` until its `deleteSurface`, whichever runs carry them.
 * - A deleted surface leaves the lists, and so does a loading placeholder its turn left behind
 *   once it stopped streaming.
 *
 * @group Surfaces
 */
export interface DiscoveredSurface {
  /** The id of the A2-UI surface: never empty, and unique among the session's live surfaces. */
  surfaceId: string;
  // Consumers and navigation compare this root type against 'CommerceSearch' today.
  /**
   * The PascalCase `component` of the surface's root node, such as `'CommerceSearch'`. Never empty.
   * It is interim and may be removed in a breaking release.
   */
  rootComponentType: string;
  // This loading flag comes from the commerce catalog data model.
  /**
   * Whether the surface is a loading placeholder: its data model sets `isLoading: true`.
   *
   * @remarks
   * - A consumer renders a placeholder for `rootComponentType` while it is `true`.
   * - Loading ends when the agent deletes the surface, which leaves the lists, or sets
   *   `isLoading: false` in its data model.
   * - A placeholder is listed only while the run that created it streams. One the agent left
   *   behind, after a cancelled run, an error or a restore, leaves the lists, and a later request
   *   streaming into its turn doesn't bring it back.
   */
  isLoading: boolean;
  /**
   * `true` on a surface of a restored session that shows an earlier page: one a restored turn
   * created before the last restored turn that created one.
   *
   * @remarks
   * - {@link Session.dispatchAction} sends none of its actions, except `productClick`, which the
   *   endpoint still counts, so a consumer draws it without its controls but keeps its product
   *   links.
   * - It is absent on every other surface, such as the ones the last restored turn created, the
   *   restored shell, the new shell the resuming `initialize` answers with, or a surface a later
   *   run creates again.
   */
  readOnly?: true;
}

// Keep the operation shapes untyped here: they belong to the renderer protocol, not Thermidor's
// domain model.
/**
 * A single A2-UI message in the v0.9 shape renderers consume, as listed in
 * {@link Session.a2uiMessages}.
 *
 * @remarks
 * The endpoint streams A2-UI v1.0, and the available renderers, such as
 * `@copilotkit/a2ui-renderer`, consume v0.9, so the session converts each message. A consumer
 * hands the stream to a renderer as is, with no version-specific code. This conversion is interim:
 * a breaking release will remove it once a v1.0-capable renderer exists.
 *
 * @group Surfaces
 */
export type A2uiV09Message = Record<string, unknown>;

/**
 * The lifecycle status of a {@link ToolCall}.
 *
 * @group Turns
 */
export type ToolCallStatus = 'calling' | 'completed';

/**
 * A tool the agent invoked during a turn, in the order the stream started it.
 *
 * @group Turns
 */
export interface ToolCall {
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

/**
 * A text message the agent streamed during a turn, in the order the stream started it. Its
 * `content` grows while the message streams.
 *
 * @group Turns
 */
export interface AgentMessage {
  /**
   * The text content of the message.
   */
  content: string;

  /**
   * The origin role of the message, as the stream sent it. `'assistant'` when the stream named
   * none.
   */
  role: string;
}

/**
 * A single activity snapshot the endpoint streamed during a turn or the initialization, such as
 * the A2-UI messages of a surface.
 *
 * @group Turns
 */
export interface Activity {
  /**
   * The AG-UI `messageId` of the snapshot. A later snapshot of the same turn with the same id
   * supersedes this activity in place, unless its `replace` is `false`. An empty string when the
   * event had none, which no later snapshot matches.
   */
  id: string;
  /**
   * The AG-UI `activityType` of the snapshot, such as `'a2ui-surface'` for one that carries A2-UI
   * surface messages. An empty string when the event had none.
   */
  kind: string;
  /**
   * Whether the snapshot supersedes the earlier activity of the same turn with the same `id`.
   * AG-UI defaults it to `true` when the event omits it. When no such activity exists, or `id` is
   * empty, the snapshot is added as a new activity.
   */
  replace: boolean;
  /**
   * The snapshot's content. For an `'a2ui-surface'` activity, its `messages` array holds the A2-UI
   * messages that create, update or delete surfaces.
   *
   * @remarks
   * When the snapshot replaced an activity with the same `id` in this turn and both payloads carry
   * a `messages` array, earlier `updateDataModel` writes at a surface and path this snapshot
   * doesn't write are kept before its messages, unless this snapshot creates or deletes that
   * surface. A write at the same path on another surviving surface is kept; a whole-model write
   * without a path has no slice and isn't carried forward. The earlier latest `updateComponents`
   * is also kept when this one sends none, except for a surface this snapshot creates or deletes.
   * Otherwise it is this snapshot's content unchanged.
   */
  payload: Record<string, unknown>;
  /**
   * The AG-UI `metadata` of the event that carried the activity, when it had one. A producer
   * announces the turn-opening actions of a surface under its `turnOpeningActions` key, and its
   * concurrent actions, with their cache policy, under `concurrentActions`.
   */
  metadata?: Record<string, unknown>;
}

/**
 * What the agent streamed for a turn: its text messages and tool calls. Present as
 * {@link TurnResponse.agent} only when the endpoint routed the turn to an agent.
 *
 * @group Turns
 */
export interface TurnAgent {
  /**
   * The text messages the agent streamed for the prompt or action that opened the turn, in the
   * order they started. Text streamed for a later component action recorded with the turn isn't
   * kept.
   */
  messages: AgentMessage[];
  /**
   * The tools the agent called for the prompt or action that opened the turn, in the order they
   * started. Tool calls streamed for a later component action recorded with the turn aren't kept.
   */
  toolCalls: ToolCall[];
}

/**
 * A request the session is sending: the `initialize` that opens the session, a prompt that streams
 * a turn, or a component action (a follow-up included).
 *
 * @group Requests and initialization
 */
export type SessionRequest = InitializeRequest | PromptRequest | ActionRequest;

/**
 * The `initialize` action the session sends to open itself, recorded as
 * {@link Session.initialization}.
 *
 * @group Requests and initialization
 */
export interface InitializeRequest {
  /** Identifies an `initialize` request. */
  kind: 'initialize';
}

/**
 * A prompt the session is sending, streaming into a new turn or a retried one.
 *
 * @group Requests and initialization
 */
export interface PromptRequest {
  /** Identifies a prompt request. */
  kind: 'prompt';
  /** The turn the prompt streams into. */
  turnId: string;
}

/**
 * A component action the session is sending.
 *
 * @group Requests and initialization
 */
export interface ActionRequest {
  /** Identifies a component action request. */
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
   * before the first turn, when the response is recorded with {@link Session.initialization}.
   */
  turnId?: string;
}

/**
 * A concurrent action whose latest dispatch from its node awaits its answer (ADR-020), listed in
 * `Session.concurrentRequests`. An older dispatch from the same node that is passed over is not
 * listed: its answer is never applied.
 *
 * @group Requests and initialization
 */
export interface ConcurrentRequest {
  /** The `component` discriminant of the dispatching node. */
  component: string;
  /** The action name declared by the dispatching component's contract. */
  name: string;
  /** The A2-UI surface the action originated on. */
  surfaceId: string;
  /** The id of the node that dispatched the action. */
  sourceComponentId: string;
}

/**
 * The failure of a concurrent action's latest dispatch from its node (ADR-020), listed in
 * `Session.concurrentFailures` until the node dispatches that action again, concurrently or, once
 * the producer no longer announces it as concurrent, as the session's request.
 *
 * @group Actions
 */
export interface ConcurrentFailure extends ConcurrentRequest {
  /** Why the dispatch failed. */
  message: string;
  /**
   * The code of the gateway's `RUN_ERROR` that failed the dispatch, such as
   * `'AGENT:UPSTREAM_TIMEOUT'`. Absent when the gateway sent none or the dispatch failed otherwise.
   */
  errorCode?: string;
}

/**
 * Why a component action failed, and the action it came from, so a consumer can show the failure
 * next to the block that dispatched it.
 *
 * @group Actions
 */
export interface ActionError {
  /** Why the action failed. */
  message: string;
  /**
   * The code of the gateway's `RUN_ERROR` that failed the action, such as `'AGENT:UPSTREAM_TIMEOUT'`.
   * Absent when the gateway sent none or the action failed otherwise.
   */
  errorCode?: string;
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
 * @remarks
 * A prompt turn carries `prompt`. A turn opened by a component action the producer announces as
 * opening a turn, such as a follow-up chip, carries `action` instead.
 *
 * @group Turns
 */
export interface TurnInput {
  /** The prompt the turn answers, for a turn a prompt opened. */
  prompt?: string;
  /** The component action the turn answers, for a turn an action opened. */
  action?: TurnAction;
}

/**
 * A component action that opened a turn, as it was dispatched.
 *
 * @group Turns
 */
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
 * What the endpoint streamed for a {@link Turn}.
 *
 * @remarks
 * - `activities` is always present.
 * - `surfaces` is derived from the session's activities.
 * - `agent` is present only when the endpoint routed the turn to an agent.
 * - The renderer stream and the component state span every turn, so they live on the
 *   {@link Session}.
 * - `surfaces` on a turn is interim and may be removed in a breaking release; prefer
 *   {@link Session.surfaces}.
 *
 * @group Turns
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
   * `activities` themselves. A surface a later run deletes leaves the list. One
   * a later run creates again under its live id, such as the answer to an
   * action recorded with a later turn, stays with this turn.
   */
  surfaces: DiscoveredSurface[];

  /**
   * What the agent streamed for the turn. Present only when the endpoint routed the turn to an
   * agent.
   */
  agent?: TurnAgent;
}

/**
 * The run of the `initialize` action that opens a session, exposed as
 * {@link Session.initialization}. Not a turn: it never appears in {@link Session.turns}.
 *
 * @group Requests and initialization
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
  /** Why it ended in `'error'`. Present when `status === 'error'`, absent otherwise. */
  reason?: TurnErrorReason;
  /**
   * The code of the gateway's `RUN_ERROR`, such as `'AGENT:UPSTREAM_TIMEOUT'`. Present only when
   * `reason === 'failed'` and the gateway sent one.
   */
  errorCode?: string;
}

/**
 * One prompt or turn-opening action, its streamed response and its status.
 *
 * @remarks
 * Its `status` is a {@link TurnStatus}; when it is `'error'`, `reason` is a
 * {@link TurnErrorReason}.
 *
 * @group Turns
 */
export interface Turn {
  /** The turn's id, assigned by the session when the turn opens. A retry keeps it. */
  id: string;
  /** The prompt or the component action the turn answers. */
  input: TurnInput;
  /**
   * What the prompt or action that opened the turn has streamed so far, plus the activity snapshots
   * of component actions that open no turn and are recorded with it. A retry clears it.
   */
  response: TurnResponse;
  /**
   * `'streaming'` while the request that opened or retried the turn streams, then `'complete'` or
   * `'error'`. A component action that opens no turn can still add activity snapshots to `response`
   * afterwards without changing it: {@link Session.request} shows when one is in flight, and
   * {@link Session.actionError} when one fails.
   */
  status: TurnStatus;
  /** Why the turn failed. Present when `status === 'error'`, absent otherwise. */
  error?: string;
  /** Why it ended in `'error'`. Present when `status === 'error'`, absent otherwise. */
  reason?: TurnErrorReason;
  /**
   * The code of the gateway's `RUN_ERROR`, such as `'AGENT:UPSTREAM_TIMEOUT'`. Present only when
   * `reason === 'failed'` and the gateway sent one.
   */
  errorCode?: string;
}
