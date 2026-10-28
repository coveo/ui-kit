/**
 * The canonical runtime domain model for the session client.
 *
 * `state` and `activities` are routing-neutral and live at the top of
 * `response`; only `messages` and `reasoningSteps` are agent-specific and move
 * under the optional `agent` facet, whose presence signals "the router invoked
 * an agent".
 */

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
   * announces the turn-opening actions of a surface under its `turnOpeningActions` key.
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
