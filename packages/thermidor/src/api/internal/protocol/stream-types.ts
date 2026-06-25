/**
 * Layer 1: Protocol Event Types
 *
 * Re-exports AG-UI standard event types and defines Coveo-specific extensions
 * for the converse endpoint wire format.
 *
 * All events have a discriminant `type` field for exhaustive pattern matching.
 */

// ============================================================================
// AG-UI standard events (re-exported)
// ============================================================================

export type {
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ReasoningMessageStartEvent,
  ReasoningMessageContentEvent,
  ReasoningMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  StateSnapshotEvent,
  ActivitySnapshotEvent,
  CustomEvent,
} from '@ag-ui/core';

export {EventType} from '@ag-ui/core';

// ============================================================================
// Turn lifecycle (Coveo converse wire format — no AG-UI equivalent)
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
// Structured snapshot events (A2UI — Coveo-specific payload shape)
// ============================================================================

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

// ============================================================================
// Unknown fallback (events not recognized by AG-UI or Coveo extensions)
// ============================================================================

export type UnknownEvent = {
  type: 'UNKNOWN';
  event: string;
  payload: unknown;
};

// ============================================================================
// Union type
// ============================================================================

import type {
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ReasoningMessageStartEvent,
  ReasoningMessageContentEvent,
  ReasoningMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  StateSnapshotEvent,
  ActivitySnapshotEvent,
  CustomEvent,
} from '@ag-ui/core';

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

// ============================================================================
// Raw SSE frame (transport-level, used by buffer.ts / stream.ts)
// ============================================================================

export type RawSSEEvent = {
  event: string;
  data: string;
};
