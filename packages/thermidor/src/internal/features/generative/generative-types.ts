/**
 * ============================================================================
 * Domain types (for state / selectors)
 * ============================================================================
 */

export type TurnStatus = 'streaming' | 'complete' | 'error';

/**
 * The store-level turn shape.
 */
export interface StateTurn {
  /**
   * The unique identifier of the turn (server-provided or temporary client-generated).
   */
  id: string;

  /**
   * The user-submitted prompt text for this turn.
   */
  prompt: string;

  /**
   * The current lifecycle status of this turn.
   */
  status: TurnStatus;

  /**
   * Present when the turn resulted in agent mode.
   */
  agentResponse?: AgentResponse;

  /**
   * A human-readable error message when the turn is in error status.
   */
  error?: string;
}

/**
 * The public-facing turn shape exposed to consumers.
 */
export interface Turn {
  /**
   * The unique identifier of the turn (server-provided or temporary client-generated).
   */
  id: string;

  /**
   * The user-submitted prompt text for this turn.
   */
  prompt: string;

  /**
   * The current lifecycle status of this turn.
   */
  status: TurnStatus;

  /**
   * Present when the turn resulted in agent mode.
   */
  agentResponse?: AgentResponse;

  /**
   * A human-readable error message when the turn is in error status.
   */
  error?: string;
}

/**
 * The agent's response for a turn: the latest server-owned state snapshot plus
 * the messages, surfaces, activities, and reasoning steps received while streaming.
 */
export interface AgentResponse {
  /**
   * The latest server-owned AG-UI state snapshot for this turn.
   * Thermidor retains this opaque object without coupling it to a UI protocol.
   */
  state: Record<string, unknown>;

  /**
   * The ordered messages received from the agent during streaming.
   */
  messages: AgentMessage[];

  /**
   * The opaque A2UI surfaces received during streaming.
   */
  surfaces: A2UISurface[];

  /**
   * Structured activities emitted by the agent during streaming.
   * Thermidor keeps each activity opaque; applications select and interpret the
   * activity kinds they support.
   */
  activities: Activity[];

  /**
   * An ordered sequence of reasoning steps that preserves the temporal
   * interleaving of reasoning messages and tool calls as produced by the
   * agent during the turn.
   */
  reasoningSteps: ReasoningStep[];
}

/**
 * A single step in the agent's reasoning process — either a reasoning message
 * or a tool-call invocation. The array order in `AgentResponse.reasoningSteps`
 * reflects the chronological order of events received from the stream.
 */
export type ReasoningStep = ReasoningMessageStep | ToolCallStep;

interface ReasoningMessageStep {
  type: 'reasoning';

  /**
   * The accumulated reasoning/thinking text for this step.
   */
  content: string;
}

type ToolCallStatus = 'calling' | 'completed';

/**
 * A reasoning step representing a single tool-call invocation made by the agent.
 */
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

/**
 * A single message produced by the agent during a turn.
 */
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
 * Opaque surface data passed through from `/converse`, augmented with an
 * internal activity identifier for lifecycle tracking.
 */
export type A2UISurface = Record<string, unknown> & {
  __thermidorActivityId?: string;
};

/**
 * Represents a single activity emitted during an agent response turn.
 */
export interface Activity {
  /** Stable identifier of the activity within the turn. */
  id: string;
  /** The activity kind; applications interpret the kinds they support. */
  kind: string;
  /** When `true`, this activity replaces the prior activity with the same id. */
  replace: boolean;
  /** The opaque, kind-specific activity payload. */
  payload: Record<string, unknown>;
}

export interface GenerativeState {
  /**
   * The ordered turn history for this generative interface (serializable only).
   */
  turns: StateTurn[];

  /**
   * The id of the currently active turn, or undefined when no turns exist.
   */
  activeTurnId: string | undefined;

  /**
   * The server-assigned conversation session identifier, used to continue
   * multi-turn conversations.
   */
  conversationSessionId: string | undefined;

  /**
   * The server-assigned conversation token for request authentication continuity.
   */
  conversationToken: string | undefined;
}
