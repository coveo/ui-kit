import type {BaseEvent} from '@ag-ui/core';
import type {ParsedEvent} from '../types/agent.js';

export function extractStreamingProgress(event: BaseEvent): string | undefined {
  if (!event || typeof event !== 'object') {
    return undefined;
  }

  const typedEvent = event as Record<string, unknown>;
  const eventType = String(typedEvent.type ?? '').toUpperCase();
  const payload =
    typeof typedEvent.payload === 'object' && typedEvent.payload !== null
      ? (typedEvent.payload as Record<string, unknown>)
      : undefined;

  if (eventType === 'REASONING_START') {
    return 'Reasoning...';
  }

  if (eventType === 'TEXT_MESSAGE_START') {
    return 'Writing response...';
  }

  if (eventType === 'TOOL_CALL_START') {
    const toolCall =
      typeof typedEvent.toolCall === 'object' && typedEvent.toolCall !== null
        ? (typedEvent.toolCall as Record<string, unknown>)
        : undefined;

    const toolName =
      extractString(typedEvent.toolCallName) ??
      extractString(payload?.toolCallName) ??
      extractString(toolCall?.name) ??
      extractString(typedEvent.name) ??
      'tool';

    return `Tool: ${toolName}`;
  }

  return undefined;
}

export function parseAgentEvent(event: BaseEvent): ParsedEvent {
  if (!event || typeof event !== 'object') {
    return {type: 'error', error: 'Invalid event structure'};
  }

  const typedEvent = event as Record<string, unknown>;
  const eventType = String(typedEvent.type ?? '');
  const normalizedEventType = eventType.toUpperCase();

  const payload =
    typeof typedEvent.payload === 'object' && typedEvent.payload !== null
      ? (typedEvent.payload as Record<string, unknown>)
      : undefined;

  const textDelta =
    extractString(typedEvent.delta) ??
    extractString(payload?.delta) ??
    extractString(typedEvent.text) ??
    extractString(payload?.text) ??
    extractString(typedEvent.content) ??
    extractString(payload?.content) ??
    extractString(typedEvent.data) ??
    extractString(payload?.data);

  if (
    normalizedEventType === 'TEXT_MESSAGE_CONTENT' ||
    normalizedEventType === 'TEXT_MESSAGE_CHUNK' ||
    eventType === 'stream'
  ) {
    if (textDelta) {
      return {type: 'message', content: textDelta};
    }
  }

  if (normalizedEventType === 'ACTIVITY_SNAPSHOT') {
    const messageId =
      extractString(typedEvent.messageId) ??
      extractString(payload?.messageId) ??
      `activity-${Date.now()}`;
    const activityType =
      extractString(typedEvent.activityType) ??
      extractString(payload?.activityType) ??
      'unknown';
    const rawContent =
      typedEvent.content ?? payload?.content ?? typedEvent.data ?? {};
    const content =
      typeof rawContent === 'object' && rawContent !== null
        ? (rawContent as Record<string, unknown>)
        : {};
    return {
      type: 'activity_snapshot',
      activitySnapshot: {messageId, activityType, content},
    };
  }

  if (normalizedEventType === 'ACTIVITY_DELTA') {
    const messageId =
      extractString(typedEvent.messageId) ??
      extractString(payload?.messageId) ??
      '';
    const activityType =
      extractString(typedEvent.activityType) ??
      extractString(payload?.activityType) ??
      'unknown';
    const patch = Array.isArray(typedEvent.patch)
      ? typedEvent.patch
      : Array.isArray(payload?.patch)
        ? (payload.patch as unknown[])
        : [];
    return {
      type: 'activity_delta',
      activityDelta: {messageId, activityType, patch},
    };
  }

  if (eventType === 'activity' || eventType === 'a2ui_activity') {
    const rawContent =
      typeof typedEvent.payload === 'object' && typedEvent.payload !== null
        ? (typedEvent.payload as Record<string, unknown>)
        : {};
    return {
      type: 'activity_snapshot',
      activitySnapshot: {
        messageId: `activity-${Date.now()}`,
        activityType: 'a2ui-surface',
        content: rawContent,
      },
    };
  }

  if (
    normalizedEventType === 'RUN_STARTED' ||
    normalizedEventType === 'RUN_FINISHED' ||
    normalizedEventType === 'RUN_ERROR' ||
    normalizedEventType === 'RUN_FAILED'
  ) {
    return {type: 'lifecycle'};
  }

  if (eventType === 'error' || typedEvent.error) {
    const errorMsg =
      typeof typedEvent.error === 'string'
        ? typedEvent.error
        : typeof typedEvent.data === 'string'
          ? typedEvent.data
          : 'Unknown error';

    return {type: 'error', error: errorMsg};
  }

  return {type: 'lifecycle'};
}

function extractString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
