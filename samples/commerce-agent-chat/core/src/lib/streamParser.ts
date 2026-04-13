import type {
  BaseEvent,
  TextMessageContentEvent,
  TextMessageChunkEvent,
  ToolCallStartEvent,
} from '@ag-ui/client';
import type {ParsedEvent} from '../types/agent.js';

export function extractStreamingProgress(event: BaseEvent): string | undefined {
  if (!event || typeof event !== 'object') {
    return undefined;
  }

  const eventType = String(
    (event as Record<string, unknown>).type ?? ''
  ).toUpperCase();

  if (eventType === 'REASONING_START') {
    return 'Reasoning...';
  }

  if (eventType === 'TEXT_MESSAGE_START') {
    return 'Writing response...';
  }

  if (eventType === 'TOOL_CALL_START') {
    const toolName = (event as ToolCallStartEvent).toolCallName ?? 'tool';
    return `Tool: ${toolName}`;
  }

  return undefined;
}

export function parseAgentEvent(event: BaseEvent): ParsedEvent {
  if (!event || typeof event !== 'object') {
    return {type: 'error', error: 'Invalid event structure'};
  }

  const typedEvent = event as Record<string, unknown>;
  const eventType = String(typedEvent.type ?? '').toUpperCase();

  if (eventType === 'TEXT_MESSAGE_CONTENT') {
    const delta = (event as TextMessageContentEvent).delta;
    if (delta) return {type: 'message', content: delta};
  }

  if (eventType === 'TEXT_MESSAGE_CHUNK') {
    const delta = (event as TextMessageChunkEvent).delta;
    if (delta) return {type: 'message', content: delta};
  }

  if (eventType === 'ACTIVITY_SNAPSHOT') {
    const messageId =
      extractString(typedEvent.messageId) ?? `activity-${Date.now()}`;
    const activityType = extractString(typedEvent.activityType) ?? 'unknown';
    const rawContent = typedEvent.content ?? typedEvent.data ?? {};
    const content =
      typeof rawContent === 'object' && rawContent !== null
        ? (rawContent as Record<string, unknown>)
        : {};
    return {
      type: 'activity_snapshot',
      activitySnapshot: {messageId, activityType, content},
    };
  }

  if (eventType === 'ACTIVITY_DELTA') {
    const messageId = extractString(typedEvent.messageId) ?? '';
    const activityType = extractString(typedEvent.activityType) ?? 'unknown';
    const patch = Array.isArray(typedEvent.patch) ? typedEvent.patch : [];
    return {
      type: 'activity_delta',
      activityDelta: {messageId, activityType, patch},
    };
  }

  if (eventType === 'ACTIVITY' || eventType === 'A2UI_ACTIVITY') {
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
    eventType === 'RUN_STARTED' ||
    eventType === 'RUN_FINISHED' ||
    eventType === 'RUN_ERROR' ||
    eventType === 'RUN_FAILED'
  ) {
    return {type: 'lifecycle'};
  }

  if (eventType === 'ERROR' || typedEvent.error) {
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
