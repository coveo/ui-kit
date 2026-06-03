/**
 * ============================================================================
 * Domain types (for state / selectors)
 * ============================================================================
 */

export type ConversationMessageRole = 'user' | 'agent';

export interface ConversationMessage {
  /**
   * The unique identifier of the message.
   */
  id: string;

  /**
   * The origin of the message.
   */
  role: ConversationMessageRole;

  /**
   * The message content.
   */
  content: string;

  /**
   * The message creation time in epoch milliseconds.
   */
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
  /**
   * The unique identifier of the turn.
   */
  id: string;

  /**
   * The ordered references to the messages that belong to this turn.
   */
  messageIds: string[];

  /**
   * The current lifecycle status for this turn.
   */
  status: TurnStatus;

  /**
   * The turn creation time in epoch milliseconds.
   */
  createdAt: number;

  /**
   * The turn completion time in epoch milliseconds, if available.
   */
  finalizedAt?: number;
}

export interface ConversationSession {
  /**
   * The backend-issued session id used for continuity across turns.
   */
  conversationSessionId?: string;

  /**
   * The token issued by the backend after the first turn.
   */
  conversationToken?: string;
}

export interface ConversationStreaming {
  /**
   * Whether the stream is currently connected for the active turn.
   */
  isConnected: boolean;
}

/**
 * ============================================================================
 * Activity types (A2UI surface operations)
 * ============================================================================
 */

export type ConversationA2UIOperation =
  | {
      beginRendering: {
        surfaceId: string;
        root: string;
        catalogId?: string;
      };
    }
  | {
      surfaceUpdate: {
        surfaceId: string;
        components: Array<{
          id: string;
          component: Record<string, unknown>;
        }>;
      };
    }
  | {
      dataModelUpdate: {
        surfaceId: string;
        contents: Array<{
          key: string;
          valueString?: string;
          valueNumber?: number;
          valueBoolean?: boolean;
          valueMap?: Array<unknown>;
        }>;
      };
    }
  | {
      deleteSurface: {
        surfaceId: string;
      };
    };

export interface ConversationActivity {
  /**
   * The message identifier the activity is associated with.
   */
  messageId: string;

  /**
   * The type of activity.
   */
  activityType: 'a2ui-surface';

  /**
   * The accumulated A2UI surface operations for this activity.
   */
  operations: ConversationA2UIOperation[];
}

export interface ConversationState {
  /**
   * The conversation messages.
   */
  messages: ConversationMessage[];

  /**
   * The turn records used to track lifecycle and warnings/errors.
   */
  turns: ConversationTurn[];

  /**
   * The pointer to the currently active turn (if any).
   */
  activeTurnId: string | null;

  /**
   * The in-memory session continuity payload for the converse endpoint.
   */
  session: ConversationSession;

  /**
   * Whether a conversation operation is currently in progress.
   */
  isLoading: boolean;

  /**
   * The last human-readable error associated with conversation operations.
   */
  error: string | null;

  /**
   * The streaming connection state for the active conversation turn.
   */
  streaming: ConversationStreaming;

  /**
   * The A2UI surface activities received during the conversation.
   */
  activities: ConversationActivity[];
}

/**
 * ============================================================================
 * Operation types (for mutations / actions)
 * ============================================================================
 */

export interface StartTurnPayload {
  /**
   * The unique identifier for the turn to create.
   */
  turnId: string;

  /**
   * The identifier for the user-authored message in this turn.
   */
  userMessageId: string;

  /**
   * The identifier for the placeholder agent message in this turn.
   */
  agentMessageId: string;

  /**
   * The raw user input text submitted for this turn.
   */
  input: string;

  /**
   * The client timestamp (epoch ms) used as turn and message creation time.
   */
  createdAt: number;
}

export interface AppendAgentChunkPayload {
  /**
   * The identifier of the turn receiving streamed assistant content.
   */
  turnId: string;

  /**
   * The incremental assistant text chunk to append to the agent message.
   */
  chunk: string;
}

export interface FinalizeTurnPayload {
  /**
   * The identifier of the turn to finalize.
   */
  turnId: string;

  /**
   * The client timestamp (epoch ms) for terminal transition completion.
   */
  finalizedAt: number;
}

export interface FailTurnPayload extends FinalizeTurnPayload {
  /**
   * The normalized terminal failure reason for the turn lifecycle.
   */
  reason: Extract<TurnStatus, {type: 'failed'}>['reason'];
}

export interface ApplyActivitySnapshotPayload {
  /**
   * The message identifier the activity is associated with.
   */
  messageId: string;

  /**
   * The type of activity.
   */
  activityType: 'a2ui-surface';

  /**
   * The A2UI surface operations from the snapshot.
   */
  operations: ConversationA2UIOperation[];

  /**
   * Whether to replace existing operations for this message or append.
   */
  replace?: boolean;
}
