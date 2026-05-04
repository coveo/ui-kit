/**
 * Conversation Feature Types
 *
 * Defines the conversation domain: messages, turns, and session continuity.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export type ConversationMessageRole = 'user' | 'assistant' | 'system';

export type CitationRef = {
  id: string;
  title: string;
  url: string;
};

export type ToolState = {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'failed';
};

export type ConversationWarningCode =
  | 'missing_terminal_event'
  | 'unknown_stream_event'
  | 'invalid_state_transition'
  | 'double_finalization_attempt';

export type ConversationErrorSource =
  | 'transport'
  | 'protocol'
  | 'controller'
  | 'persistence';

export type StructuredConversationError = {
  code: string;
  message: string;
  source: ConversationErrorSource;
  recoverable: boolean;
  timestamp: number;
  turnId?: string;
};

export type ConversationMessage = {
  id: string;
  role: ConversationMessageRole;
  content: string;
  createdAt: number;
  metadata?: {
    turnId?: string;
    citations?: CitationRef[];
    tools?: ToolState[];
  };
};

export type TurnStatus =
  | 'pending'
  | 'streaming'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'aborted';

export type ConversationTurn = {
  id: string;
  userMessageId: string;
  assistantMessageId?: string;
  status: TurnStatus;
  createdAt: number;
  finalizedAt?: number;
  reason?: string;
  warningCodes?: ConversationWarningCode[];
};

export type ConversationSession = {
  /** Backend-assigned session ID. Empty string until the first turn is started. */
  sessionId: string;
  conversationToken?: string;
  threadId?: string;
  createdAt: number;
  updatedAt: number;
};

export interface ConversationState {
  /** Ordered list of all messages in the conversation */
  messages: ConversationMessage[];
  /** Turn records tracking lifecycle of each user/assistant exchange */
  turns: ConversationTurn[];
  /** ID of the currently active (in-flight) turn, or null */
  activeTurnId: string | null;
  /** Session continuity fields provided by the backend */
  session: ConversationSession;
  /** Whether any async operation is in-flight */
  isLoading: boolean;
  /** Human-readable error if the last operation failed */
  error: string | null;
  /** Structured error payload to support richer diagnostics */
  structuredError: StructuredConversationError | null;
}
