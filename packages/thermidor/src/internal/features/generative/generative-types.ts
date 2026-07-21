import type {CommerceInterface} from '@/src/internal/utils/index.js';
import type {SearchInterface} from '@/src/internal/utils/index.js';

/**
 * ============================================================================
 * Domain types (for state / selectors)
 * ============================================================================
 */

export type TurnStatus = 'streaming' | 'complete' | 'error';

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
   * Present when the turn resulted in routing mode.
   */
  routedInterface?: RoutedInterface;

  /**
   * Present when the turn resulted in agent mode.
   */
  agentResponse?: AgentResponse;

  /**
   * A human-readable error message when the turn is in error status.
   */
  error?: string;
}

export type UseCaseInterfaceMap = {
  commerceSearch: CommerceInterface;
  search: SearchInterface;
};

export type RoutedInterface = {
  [K in RoutedUseCase]: {
    useCase: K;
    interface: UseCaseInterfaceMap[K];
  };
}[RoutedUseCase];

export type RoutedUseCase = 'commerceSearch' | 'search';

export interface AgentResponse {
  /**
   * The ordered messages received from the agent during streaming.
   */
  messages: AgentMessage[];

  /**
   * The opaque A2UI surfaces received during streaming.
   */
  surfaces: A2UISurface[];

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
 * Opaque surface data passed through from `/converse` without interpretation.
 */
export type A2UISurface = Record<string, unknown>;

export interface GenerativeState {
  /**
   * The ordered turn history for this generative interface.
   */
  turns: Turn[];

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
