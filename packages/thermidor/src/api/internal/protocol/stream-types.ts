/**
 * Layer 1: Protocol Event Types
 *
 * Normalized stream event types for the converse endpoint.
 * Ported and adapted from the barca-sports-hydrogen SSE implementation.
 *
 * All events have a discriminant `type` field for exhaustive pattern matching.
 */

// ============================================================================
// Run lifecycle
// ============================================================================

export type RunStartedEvent = {
  type: 'RUN_STARTED';
  threadId: string;
  runId: string;
  parentRunId?: string;
  input?: unknown;
};

export type RunFinishedEvent = {
  type: 'RUN_FINISHED';
  threadId: string;
  runId: string;
  result?: unknown;
};

export type RunErrorEvent = {
  type: 'RUN_ERROR';
  message: string;
  code?: string;
};

// ============================================================================
// Turn lifecycle (Coveo converse wire format)
// ============================================================================

export type TurnStartedEvent = {
  type: 'turn_started';
  conversationSessionId?: string;
  conversationToken?: string;
};

export type TurnCompleteEvent = {
  type: 'turn_complete';
  conversationSessionId?: string;
  conversationToken?: string;
};

// ============================================================================
// Text message streaming
// ============================================================================

export type TextMessageStartEvent = {
  type: 'TEXT_MESSAGE_START';
  messageId: string;
  role: 'assistant';
};

export type TextMessageContentEvent = {
  type: 'TEXT_MESSAGE_CONTENT';
  messageId: string;
  delta: string;
};

export type TextMessageEndEvent = {
  type: 'TEXT_MESSAGE_END';
  messageId: string;
};

// ============================================================================
// Reasoning streaming (thinking)
// ============================================================================

export type ReasoningMessageStartEvent = {
  type: 'REASONING_MESSAGE_START';
  messageId: string;
  role: 'assistant';
};

export type ReasoningMessageContentEvent = {
  type: 'REASONING_MESSAGE_CONTENT';
  messageId: string;
  delta: string;
};

export type ReasoningMessageEndEvent = {
  type: 'REASONING_MESSAGE_END';
  messageId: string;
};

// ============================================================================
// Tool calls
// ============================================================================

export type ToolCallStartEvent = {
  type: 'TOOL_CALL_START';
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
};

export type ToolCallArgsEvent = {
  type: 'TOOL_CALL_ARGS';
  toolCallId: string;
  delta: string;
};

export type ToolCallEndEvent = {
  type: 'TOOL_CALL_END';
  toolCallId: string;
};

export type ToolCallResultEvent = {
  type: 'TOOL_CALL_RESULT';
  messageId: string;
  toolCallId: string;
  content: string;
  role?: 'tool';
};

// ============================================================================
// Structured snapshot events (A2UI)
// ============================================================================

export type StateSnapshotEvent = {
  type: 'STATE_SNAPSHOT';
  snapshot: Record<string, unknown>;
};

export type A2UIOperation =
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

export type ActivitySnapshotEvent = {
  type: 'ACTIVITY_SNAPSHOT';
  timestamp?: number;
  messageId: string;
  activityType: 'a2ui-surface';
  content: {
    operations: A2UIOperation[];
  };
  replace?: boolean;
};

// ============================================================================
// Custom / unknown fallback
// ============================================================================

export type CustomEvent = {
  type: 'CUSTOM';
  name: string;
  value: unknown;
};

export type UnknownEvent = {
  type: 'UNKNOWN';
  event: string;
  payload: unknown;
};

// ============================================================================
// Union type
// ============================================================================

export type NormalizedStreamEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | TurnStartedEvent
  | TurnCompleteEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ReasoningMessageStartEvent
  | ReasoningMessageContentEvent
  | ReasoningMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | ToolCallResultEvent
  | StateSnapshotEvent
  | ActivitySnapshotEvent
  | CustomEvent
  | UnknownEvent;

export type RawSSEEvent = {
  event: string;
  data: string;
};
