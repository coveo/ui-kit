/**
 * The canonical runtime domain model for the session client.
 *
 * `state` and `activities` are routing-neutral and live at the top of
 * `response`; only `messages` and `toolCalls` are agent-specific and move
 * under the optional `agent` facet, whose presence signals "the router invoked
 * an agent".
 */

/**
 * The lifecycle status of a {@link Turn}.
 */
export type TurnStatus = 'streaming' | 'complete' | 'error';

/**
 * Why a {@link Turn} or the {@link SessionInitialization} ended in `'error'`.
 *
 * - `'cancelled'`: `session.cancel()` stopped it while it streamed.
 * - `'failed'`: the endpoint sent `RUN_ERROR`, the request or stream failed, or the stream ended
 *   without a terminal event, including a run restored while it was streaming.
 */
export type TurnErrorReason = 'cancelled' | 'failed';

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
  /** The id of the A2-UI surface, unique among the session's live surfaces. */
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
  /**
   * `true` on a surface a restored turn created before the last restored turn that created one
   * (`sessionToRestore`): a snapshot of an earlier page. `dispatchAction` refuses its actions
   * without a request, except `productClick`, which the endpoint still counts, so a consumer draws
   * it without its controls but keeps its product links. Absent on every other surface, such as
   * the last restored turn's that created one, the restored shell or the new one the resuming
   * `initialize` answers with, or one a later run creates again.
   */
  readOnly?: true;
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
 * The lifecycle status of a {@link ToolCall}.
 */
export type ToolCallStatus = 'calling' | 'completed';

/**
 * A tool the agent invoked during a turn, in the order the stream started it.
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
 * Represents a single activity emitted during a turn's streamed response.
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
   * The snapshot's content. When it replaced an activity with the same `id` in this turn and both
   * payloads carry a `messages` array, earlier `updateDataModel` writes at a surface and path this
   * snapshot doesn't write are kept before its messages, unless this snapshot creates or deletes
   * that surface. A write at the same path on another surviving surface is kept; a whole-model
   * write without a path has no slice and isn't carried forward.
   * The earlier latest `updateComponents` is also kept when this one sends none, except for a
   * surface this snapshot creates or deletes. Otherwise it is this snapshot's content unchanged.
   * For an `'a2ui-surface'` activity, its
   * `messages` array holds the A2-UI messages that create, update or delete surfaces.
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
 * Agent-specific content, present only when the router invoked an agent for the
 * turn. Kept separate from the routing-neutral {@link TurnResponse} fields.
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
 */
export type SessionRequest = InitializeRequest | PromptRequest | ActionRequest;

/** The `initialize` action the session sends to open itself, recorded as `Session.initialization`. */
export interface InitializeRequest {
  /** Identifies an `initialize` request. */
  kind: 'initialize';
}

/** A prompt the session is sending, streaming into a new turn or a retried one. */
export interface PromptRequest {
  /** Identifies a prompt request. */
  kind: 'prompt';
  /** The turn the prompt streams into. */
  turnId: string;
}

/** A component action the session is sending. */
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
   * `activities` themselves. A surface a later run deletes leaves the list. One
   * a later run creates again under its live id, such as the answer to an
   * action recorded with a later turn, stays with this turn.
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
  /** Why it ended in `'error'`. Present when `status === 'error'`, absent otherwise. */
  reason?: TurnErrorReason;
  /**
   * The code of the gateway's `RUN_ERROR`, such as `'AGENT:UPSTREAM_TIMEOUT'`. Present only when
   * `reason === 'failed'` and the gateway sent one.
   */
  errorCode?: string;
}

/**
 * One `input` paired with its streamed `response`.
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
