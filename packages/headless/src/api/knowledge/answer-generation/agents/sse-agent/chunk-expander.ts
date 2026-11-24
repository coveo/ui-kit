import {
  type BaseEvent,
  EventType,
  type TextMessageChunkEvent,
  type TextMessageContentEvent,
  type TextMessageEndEvent,
  type TextMessageStartEvent,
  type ToolCallArgsEvent,
  type ToolCallChunkEvent,
  type ToolCallEndEvent,
  type ToolCallStartEvent,
} from '@ag-ui/core';

type OpenChunkStream = {kind: 'text'; messageId: string} | {kind: 'tool'; toolCallId: string};

const eventTypesThatKeepChunkStreamOpen = new Set<string>([
  EventType.RAW,
  EventType.ACTIVITY_SNAPSHOT,
  EventType.ACTIVITY_DELTA,
  EventType.REASONING_ENCRYPTED_VALUE,
  EventType.SUBAGENT_STARTED,
  EventType.SUBAGENT_FINISHED,
  EventType.SUBAGENT_ERROR,
]);

/**
 * Expands `TEXT_MESSAGE_CHUNK` and `TOOL_CALL_CHUNK` events into their explicit
 * start / content (or args) / end events, the way the official AG-UI client does before notifying subscribers.
 * The open chunk stream is closed by the next non-chunk event, or by a chunk for another message or tool call.
 *
 * Unlike the official AG-UI client, this doesn't track subagent lanes: the answer generation endpoints don't use subagents.
 *
 * @returns A function that maps each incoming event to the events to dispatch.
 */
export function createChunkExpander() {
  let openStream: OpenChunkStream | undefined;

  const closeOpenStream = (): BaseEvent[] => {
    const stream = openStream;
    openStream = undefined;
    if (!stream) {
      return [];
    }
    if (stream.kind === 'text') {
      return [
        {type: EventType.TEXT_MESSAGE_END, messageId: stream.messageId} as TextMessageEndEvent,
      ];
    }
    return [{type: EventType.TOOL_CALL_END, toolCallId: stream.toolCallId} as ToolCallEndEvent];
  };

  const expandTextMessageChunk = (chunk: TextMessageChunkEvent): BaseEvent[] => {
    const events: BaseEvent[] = [];
    const continuesOpenStream =
      openStream?.kind === 'text' &&
      (chunk.messageId === undefined || chunk.messageId === openStream.messageId);

    if (!continuesOpenStream) {
      events.push(...closeOpenStream());
      if (chunk.messageId === undefined) {
        throw new Error('First TEXT_MESSAGE_CHUNK must have a messageId');
      }
      openStream = {kind: 'text', messageId: chunk.messageId};
      events.push({
        type: EventType.TEXT_MESSAGE_START,
        messageId: chunk.messageId,
        role: chunk.role || 'assistant',
        ...(chunk.name !== undefined && {name: chunk.name}),
      } as TextMessageStartEvent);
    }

    if (chunk.delta !== undefined) {
      events.push({
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: (openStream as {messageId: string}).messageId,
        delta: chunk.delta,
      } as TextMessageContentEvent);
    }
    return events;
  };

  const expandToolCallChunk = (chunk: ToolCallChunkEvent): BaseEvent[] => {
    const events: BaseEvent[] = [];
    const continuesOpenStream =
      openStream?.kind === 'tool' &&
      (chunk.toolCallId === undefined || chunk.toolCallId === openStream.toolCallId);

    if (!continuesOpenStream) {
      events.push(...closeOpenStream());
      if (chunk.toolCallId === undefined) {
        throw new Error('First TOOL_CALL_CHUNK must have a toolCallId');
      }
      if (chunk.toolCallName === undefined) {
        throw new Error('First TOOL_CALL_CHUNK must have a toolCallName');
      }
      openStream = {kind: 'tool', toolCallId: chunk.toolCallId};
      events.push({
        type: EventType.TOOL_CALL_START,
        toolCallId: chunk.toolCallId,
        toolCallName: chunk.toolCallName,
        parentMessageId: chunk.parentMessageId,
      } as ToolCallStartEvent);
    }

    if (chunk.delta !== undefined) {
      events.push({
        type: EventType.TOOL_CALL_ARGS,
        toolCallId: (openStream as {toolCallId: string}).toolCallId,
        delta: chunk.delta,
      } as ToolCallArgsEvent);
    }
    return events;
  };

  return (event: BaseEvent): BaseEvent[] => {
    switch (event.type) {
      case EventType.TEXT_MESSAGE_CHUNK:
        return expandTextMessageChunk(event as TextMessageChunkEvent);
      case EventType.TOOL_CALL_CHUNK:
        return expandToolCallChunk(event as ToolCallChunkEvent);
      default:
        if (eventTypesThatKeepChunkStreamOpen.has(event.type)) {
          return [event];
        }
        return [...closeOpenStream(), event];
    }
  };
}
