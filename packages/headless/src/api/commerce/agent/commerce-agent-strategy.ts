import type {
  AgentSubscriber,
  TextMessageContentEvent,
  ToolCallStartEvent,
} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  addProgressStep,
  addTraceEntry,
  appendAgentText,
  applyAgentActivityDelta,
  applyThreadStateDelta,
  markAllTraceCompleted,
  persistMessageProgress,
  setAgentChatError,
  setStreamingActive,
  setThreadStateSnapshot,
  updateTraceEntry,
  upsertAgentActivity,
} from '../../../features/commerce/agent-chat/agent-chat-actions.js';

/**
 * Creates an AgentSubscriber that handles commerce agent chat streaming events
 * and dispatches Redux actions for state updates.
 *
 * Follows the same pattern as `createHeadAnswerStrategy` from the generated answer feature.
 */
export const createCommerceAgentStrategy = (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
  assistantMessageId: string
): AgentSubscriber => {
  let hasTextMessageStarted = false;

  return {
    onRunStartedEvent: () => {
      hasTextMessageStarted = false;
    },

    onTextMessageStartEvent: () => {
      hasTextMessageStarted = true;
      dispatch(addProgressStep({step: 'Writing response...'}));
    },

    onTextMessageContentEvent: ({event}) => {
      if (!hasTextMessageStarted) {
        return;
      }
      const delta = (event as TextMessageContentEvent).delta;
      if (delta) {
        dispatch(appendAgentText({messageId: assistantMessageId, text: delta}));
      }
    },

    onToolCallStartEvent: ({event}) => {
      const toolName = (event as ToolCallStartEvent).toolCallName ?? 'tool';
      dispatch(addProgressStep({step: `Tool: ${toolName}`}));

      const toolCallId = String(
        (event as Record<string, unknown>).toolCallId ?? `tool-${Date.now()}`
      );
      dispatch(
        addTraceEntry({
          entry: {
            id: toolCallId,
            kind: 'tool',
            label: toolName,
            text: '',
            status: 'streaming',
          },
        })
      );
    },

    onToolCallEndEvent: ({event}) => {
      const toolCallId = String(
        (event as Record<string, unknown>).toolCallId ?? 'tool'
      );
      dispatch(updateTraceEntry({id: toolCallId, status: 'completed'}));
    },

    onStateSnapshotEvent: ({event}) => {
      const snapshot = (event as Record<string, unknown>).snapshot;
      if (snapshot && typeof snapshot === 'object') {
        dispatch(setThreadStateSnapshot(snapshot as Record<string, unknown>));
      }
    },

    onStateDeltaEvent: ({event}) => {
      const delta = (event as Record<string, unknown>).delta;
      if (Array.isArray(delta)) {
        dispatch(applyThreadStateDelta(delta));
      }
    },

    onActivitySnapshotEvent: ({event}) => {
      const typedEvent = event as Record<string, unknown>;
      const activityId =
        extractString(typedEvent.messageId) ?? `activity-${Date.now()}`;
      const activityType = extractString(typedEvent.activityType) ?? 'unknown';
      const rawData = typedEvent.content ?? typedEvent.data ?? {};
      const data =
        typeof rawData === 'object' && rawData !== null
          ? (rawData as Record<string, unknown>)
          : {};

      dispatch(
        upsertAgentActivity({
          messageId: assistantMessageId,
          activityId,
          activityType,
          data,
        })
      );
    },

    onActivityDeltaEvent: ({event}) => {
      const typedEvent = event as Record<string, unknown>;
      const activityId = extractString(typedEvent.messageId) ?? '';
      const activityType = extractString(typedEvent.activityType) ?? 'unknown';
      const patch = Array.isArray(typedEvent.patch) ? typedEvent.patch : [];

      if (activityId && patch.length > 0) {
        dispatch(
          applyAgentActivityDelta({
            messageId: assistantMessageId,
            activityId,
            activityType,
            patch,
            sourceOwner: 'backend',
          })
        );
      }
    },

    onRunFinishedEvent: () => {
      dispatch(addProgressStep({step: 'Done'}));
      dispatch(markAllTraceCompleted());
      dispatch(persistMessageProgress({messageId: assistantMessageId}));
      dispatch(setStreamingActive(false));
    },

    onRunErrorEvent: ({event}) => {
      const typedEvent = event as Record<string, unknown>;
      dispatch(
        setAgentChatError({
          message: String(typedEvent.message ?? 'Agent error'),
          code:
            typeof typedEvent.code === 'number' ? typedEvent.code : undefined,
        })
      );
      dispatch(addProgressStep({step: 'Response failed'}));
      dispatch(markAllTraceCompleted());
      dispatch(persistMessageProgress({messageId: assistantMessageId}));
      dispatch(setStreamingActive(false));
    },

    onRunFailed: ({error}) => {
      dispatch(
        setAgentChatError({
          message: error.message || 'Stream error occurred',
        })
      );
      dispatch(addProgressStep({step: 'Response failed'}));
      dispatch(markAllTraceCompleted());
      dispatch(persistMessageProgress({messageId: assistantMessageId}));
      dispatch(setStreamingActive(false));
    },

    // Catch-all for events not handled by specific callbacks (e.g., reasoning events)
    onEvent: ({event}) => {
      const typedEvent = event as Record<string, unknown>;
      const eventType = String(typedEvent.type ?? '').toUpperCase();

      // Handle reasoning events
      if (
        eventType === 'REASONING_START' ||
        eventType === 'REASONING_MESSAGE_START'
      ) {
        dispatch(addProgressStep({step: 'Reasoning...'}));

        const messageId = String(
          typedEvent.messageId ?? `reasoning-${Date.now()}`
        );
        dispatch(
          addTraceEntry({
            entry: {
              id: messageId,
              kind: 'reasoning',
              label: 'Reasoning',
              text: '',
              status: 'streaming',
            },
          })
        );
      }

      if (
        eventType === 'REASONING_MESSAGE_CONTENT' ||
        eventType === 'REASONING_MESSAGE_CHUNK'
      ) {
        const messageId = String(typedEvent.messageId ?? 'reasoning');
        const delta = String(typedEvent.delta ?? '');
        if (delta) {
          dispatch(updateTraceEntry({id: messageId, text: delta}));
        }
      }

      if (
        eventType === 'REASONING_MESSAGE_END' ||
        eventType === 'REASONING_END'
      ) {
        const messageId = String(typedEvent.messageId ?? 'reasoning');
        dispatch(updateTraceEntry({id: messageId, status: 'completed'}));
      }

      // Handle legacy Coveo activity event formats
      if (eventType === 'ACTIVITY' || eventType === 'A2UI_ACTIVITY') {
        const rawData =
          typeof typedEvent.payload === 'object' && typedEvent.payload !== null
            ? (typedEvent.payload as Record<string, unknown>)
            : {};
        dispatch(
          upsertAgentActivity({
            messageId: assistantMessageId,
            activityId: `activity-${Date.now()}`,
            activityType: 'a2ui-surface',
            data: rawData,
          })
        );
      }
    },
  };
};

function extractString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
