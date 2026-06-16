import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

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

export interface RoutedInterface {
  /**
   * The developer-facing use-case key (matches the registration key).
   * e.g., 'commerceSearch' or 'search'
   */
  useCase: RoutedUseCase;

  /**
   * The hydrated sub-interface for this routed turn.
   */
  interface: Interface<any>;
}

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
   * Tool calls made by the agent during the turn, in order of invocation.
   */
  toolCalls: ToolCall[];
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
   * The ordered turn history for this generative interface.
   */
  turns: Turn[];

  /**
   * The id of the currently active turn, or undefined when no turns exist.
   */
  activeTurnId: string | undefined;
}

/**
 * ============================================================================
 * Configuration types
 * ============================================================================
 */

export type ControllerBuilder = (options: {
  interface: Interface<any>;
}) => Controller;

export interface GenerativeInterfaceOptions {
  /**
   * Controller builders to instantiate when hydrating a commerce search sub-interface.
   */
  commerceSearchControllers?: ControllerBuilder[];

  /**
   * Controller builders to instantiate when hydrating a search sub-interface.
   */
  searchControllers?: ControllerBuilder[];
}
