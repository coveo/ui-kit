export type ConversationMessageRole = 'user' | 'agent';

export interface ConversationMessage {
  /** The unique identifier of the message. */
  id: string;
  /** The origin of the message. */
  role: ConversationMessageRole;
  /** The message content. */
  content: string;
  /** The message creation time in epoch milliseconds. */
  createdAt: number;
}

type TurnStatusMap = {
  pending: never;
  streaming: never;
  completed: never;
  failed:
    | 'network_error'
    | 'auth_error'
    | 'stream_interrupted'
    | 'protocol_error';
  aborted: 'user_aborted';
};

export type TurnStatus = {
  [K in keyof TurnStatusMap]: TurnStatusMap[K] extends never
    ? {type: K}
    : {type: K; reason: TurnStatusMap[K]};
}[keyof TurnStatusMap];

export interface ConversationTurn {
  /** The unique identifier of the turn. */
  id: string;
  /** The ordered references to the messages that belong to this turn. */
  messageIds: string[];
  /** The current lifecycle status for this turn. */
  status: TurnStatus;
  /** The turn creation time in epoch milliseconds. */
  createdAt: number;
  /** The turn completion time in epoch milliseconds, if available. */
  finalizedAt?: number;
}

export interface ConversationSession {
  /** The backend-issued session id used for continuity across turns. */
  conversationSessionId?: string;
  /** The token issued by the backend after the first turn. */
  conversationToken?: string;
}

export interface ConversationStreaming {
  /** Whether the stream is currently connected for the active turn. */
  isConnected: boolean;
}

export interface ConversationState {
  /** The conversation messages. */
  messages: ConversationMessage[];
  /** The turn records used to track lifecycle and warnings/errors. */
  turns: ConversationTurn[];
  /** The pointer to the currently active turn (if any). */
  activeTurnId: string | null;
  /** The in-memory session continuity payload for the converse endpoint. */
  session: ConversationSession;
  /** Whether a conversation operation is currently in progress. */
  isLoading: boolean;
  /** The last human-readable error associated with conversation operations. */
  error: string | null;
  /** The streaming connection state for the active conversation turn. */
  streaming: ConversationStreaming;
}
