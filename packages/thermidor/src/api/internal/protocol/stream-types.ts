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
// A2UI v1.0 operations (carried in ACTIVITY_SNAPSHOT content.operations)
// ============================================================================

export interface A2UIComponentNode {
  id: string;
  component: string;
  [prop: string]: unknown;
}

export type A2UISurfacePlacement = 'main' | 'inline';

export interface A2UICreateSurface {
  surfaceId: string;
  catalogId?: string;
  surfaceProperties?: {placement?: A2UISurfacePlacement} & Record<
    string,
    unknown
  >;
  components: A2UIComponentNode[];
  dataModel: Record<string, unknown>;
}

export type A2UIOperation =
  | {createSurface: A2UICreateSurface}
  | {
      updateComponents: {
        surfaceId: string;
        components: A2UIComponentNode[];
      };
    }
  | {
      updateDataModel: {
        surfaceId: string;
        path: string;
        value: unknown;
      };
    }
  | {
      actionResponse: {
        actionId: string;
        value?: unknown;
        error?: unknown;
      };
    }
  | {
      deleteSurface: {
        surfaceId: string;
      };
    };

/**
 * The `content` payload of an `ACTIVITY_SNAPSHOT` event whose
 * `activityType` is `a2ui-surface`.
 */
export interface A2UISurfaceActivityContent {
  operations: A2UIOperation[];
}

export const A2UI_SURFACE_ACTIVITY_TYPE = 'a2ui-surface';

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
