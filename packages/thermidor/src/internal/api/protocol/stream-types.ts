/**
 * Layer 1: Protocol Event Types
 *
 * Re-exports AG-UI standard event types and defines Coveo-specific extensions
 * for the converse endpoint wire format.
 *
 * All events have a discriminant `type` field for exhaustive pattern matching.
 */

// ============================================================================
// Turn lifecycle (Coveo converse wire format — no AG-UI equivalent)
// ============================================================================

type TurnStartedEvent = {
  type: 'turn_started';
  conversationSessionId?: string;
  conversationToken?: string;
};

type TurnCompleteEvent = {
  type: 'turn_complete';
  conversationSessionId?: string;
  conversationToken?: string;
};

// ============================================================================
// Routed interface events (Coveo converse wire format — no AG-UI equivalent)
// ============================================================================

type CommerceSearchApiResponseEvent = {
  type: 'commerce_search_api_response';
} & Record<string, unknown>;

type SearchApiResponseEvent = {
  type: 'search_api_response';
} & Record<string, unknown>;

// ============================================================================
// Structured snapshot events (A2UI — Coveo-specific payload shape)
// ============================================================================

// ============================================================================
// Unknown fallback (events not recognized by AG-UI or Coveo extensions)
// ============================================================================

type UnknownEvent = {
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
  | CommerceSearchApiResponseEvent
  | SearchApiResponseEvent
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
