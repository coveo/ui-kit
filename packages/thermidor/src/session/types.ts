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
 * The server-authoritative UI state snapshot for a turn. Always present on a
 * {@link TurnResponse}, defaulting to `{}`. Remote controllers read this; it is
 * present for commerce-routed and agent-routed turns alike (it is NOT
 * agent-specific).
 */
export type A2uiState = Record<string, unknown>;

/**
 * A discovered renderable region derived from `activities`, exposed as the
 * typed {@link TurnResponse.surfaces} projection (ADR-015 interim). Each entry
 * carries a non-empty `surfaceId` and a non-empty `rootComponentType`.
 */
export interface DiscoveredSurface {
  surfaceId: string;
  /** Interim: compared against `'commerce-search'` by consumers/nav (ADR-015). */
  rootComponentType: string;
}

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
 * The input paired with a turn's streamed response.
 *
 * A dispatched-action turn that carries no prompt omits `prompt`.
 */
export interface TurnInput {
  prompt?: string;
}

/**
 * The streamed result of a {@link Turn}.
 *
 * `state` and `activities` are routing-neutral and always present. `surfaces`
 * is a derived projection of `activities` (ADR-015 interim). `agent` is present
 * only when the router invoked an agent.
 */
export interface TurnResponse {
  /**
   * Server-authoritative UI state snapshot. Always present (defaults to `{}`).
   */
  state: A2uiState;

  /**
   * The turn's snapshot activities in first-seen order. Always present. A
   * `replace` snapshot supersedes the earlier activity with the same
   * `messageId` in place rather than appending a duplicate, so this holds the
   * latest snapshot per `messageId`.
   */
  activities: Activity[];

  /**
   * Typed projection derived from `activities` in the fold (ADR-015 interim).
   * Consumers read this instead of walking `activities` themselves.
   */
  surfaces: DiscoveredSurface[];

  /**
   * Agent-specific content. Present ONLY when the router invoked an agent.
   */
  agent?: TurnAgent;
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
