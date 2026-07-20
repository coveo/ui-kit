import type {CommerceInterface} from '@/src/internal/utils/index.js';
import type {SearchInterface} from '@/src/internal/utils/index.js';

/**
 * ============================================================================
 * Domain types (for state / selectors)
 * ============================================================================
 */

export type TurnStatus = 'streaming' | 'complete' | 'error';

/**
 * The store-level turn shape. Uses `SerializableRoutedInterface` to avoid
 * storing non-serializable class instances in the store.
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
   * Present when the turn resulted in routing mode (serializable portion only).
   */
  routedInterface?: SerializableRoutedInterface;

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
 * Contains the full `RoutedInterface` (with the non-serializable interface instance
 * merged back from the registry).
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

export type RoutedUseCase = 'commerceSearch' | 'search';

/**
 * The serializable portion of a routed interface stored in state.
 * Does NOT contain the non-serializable interface instance.
 */
export type SerializableRoutedInterface = {
  [K in RoutedUseCase]: {
    useCase: K;
  };
}[RoutedUseCase];

/**
 * The full routed interface exposed to public consumers.
 * Contains the non-serializable interface instance merged back from the registry.
 */
export type RoutedInterface = {
  [K in RoutedUseCase]: {
    useCase: K;
    interface: UseCaseInterfaceMap[K];
  };
}[RoutedUseCase];

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
   * Tool calls made by the agent during the turn, in order of invocation.
   */
  toolCalls: ToolCall[];

  /**
   * Accumulated reasoning/thinking text received during the turn.
   */
  reasoningContent: string;
}

export type ToolCallStatus = 'calling' | 'completed';

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
