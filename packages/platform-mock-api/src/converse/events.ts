import {delay, HttpResponse} from 'msw';

const DEFAULT_SESSION_ID = '1df9f18c-785d-4ace-9642-678a7fd9fc5a';
const DEFAULT_CONVERSATION_TOKEN = 'b6fec897-550c-4b9b-90b0-71adcc7abe9f';
const DEFAULT_THREAD_ID = DEFAULT_SESSION_ID;
const DEFAULT_DELAY_MS = 25;

let runSequence = 0;

type ConverseEventType =
  | 'turn_started'
  | 'turn_complete'
  | 'message'
  | 'commerce_search_api_response'
  | 'search_api_response';

interface TurnStartedData {
  conversationSessionId: string;
  conversationToken: string;
}

interface MessageData {
  type: string;
  [key: string]: unknown;
}

interface ConverseEvent {
  event: ConverseEventType;
  data: TurnStartedData | MessageData | Record<string, unknown>;
  delayMs?: number;
}

function generateRunId(): string {
  runSequence += 1;
  return `run-${runSequence}-${Date.now().toString(36)}`;
}

const TurnStarted = (
  options: Partial<TurnStartedData> = {}
): ConverseEvent => ({
  event: 'turn_started',
  data: {
    conversationSessionId: options.conversationSessionId ?? DEFAULT_SESSION_ID,
    conversationToken: options.conversationToken ?? DEFAULT_CONVERSATION_TOKEN,
  },
});

const TurnComplete = (
  options: Partial<TurnStartedData> = {}
): ConverseEvent => ({
  event: 'turn_complete',
  data: {
    conversationSessionId: options.conversationSessionId ?? DEFAULT_SESSION_ID,
    conversationToken: options.conversationToken ?? DEFAULT_CONVERSATION_TOKEN,
  },
});

const RunStarted = (
  options: {threadId?: string; runId?: string} = {}
): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'RUN_STARTED',
    threadId: options.threadId ?? DEFAULT_THREAD_ID,
    runId: options.runId ?? generateRunId(),
  },
});

const RunFinished = (
  options: {threadId?: string; runId?: string} = {}
): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'RUN_FINISHED',
    threadId: options.threadId ?? DEFAULT_THREAD_ID,
    runId: options.runId ?? `run-${runSequence}-${Date.now().toString(36)}`,
  },
});

const StateSnapshot = (
  snapshot: Record<string, unknown> = {}
): ConverseEvent => ({
  event: 'message',
  data: {type: 'STATE_SNAPSHOT', snapshot},
});

const TextMessageStart = (options: {
  messageId: string;
  role?: string;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'TEXT_MESSAGE_START',
    messageId: options.messageId,
    role: options.role ?? 'assistant',
  },
});

const TextMessageContent = (options: {
  messageId: string;
  delta: string;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'TEXT_MESSAGE_CONTENT',
    messageId: options.messageId,
    delta: options.delta,
  },
});

const TextMessageEnd = (options: {messageId: string}): ConverseEvent => ({
  event: 'message',
  data: {type: 'TEXT_MESSAGE_END', messageId: options.messageId},
});

const ToolCallStart = (options: {
  toolCallId: string;
  toolCallName: string;
  parentMessageId: string;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'TOOL_CALL_START',
    toolCallId: options.toolCallId,
    toolCallName: options.toolCallName,
    parentMessageId: options.parentMessageId,
  },
});

const ToolCallArgs = (options: {
  toolCallId: string;
  delta: string;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'TOOL_CALL_ARGS',
    toolCallId: options.toolCallId,
    delta: options.delta,
  },
});

const ToolCallEnd = (options: {toolCallId: string}): ConverseEvent => ({
  event: 'message',
  data: {type: 'TOOL_CALL_END', toolCallId: options.toolCallId},
});

const ToolCallResult = (options: {
  messageId: string;
  toolCallId: string;
  content: string;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'TOOL_CALL_RESULT',
    messageId: options.messageId,
    toolCallId: options.toolCallId,
    content: options.content,
  },
});

const ActivitySnapshot = (options: {
  timestamp?: number;
  messageId: string;
  activityType: string;
  content: Record<string, unknown>;
  replace?: boolean;
}): ConverseEvent => ({
  event: 'message',
  data: {
    type: 'ACTIVITY_SNAPSHOT',
    timestamp: options.timestamp ?? Date.now(),
    messageId: options.messageId,
    activityType: options.activityType,
    content: options.content,
    ...(options.replace !== undefined && {replace: options.replace}),
  },
});

const CommerceSearchApiResponse = (options: {
  content: Record<string, unknown>;
}): ConverseEvent => ({
  event: 'commerce_search_api_response',
  data: options.content,
});

const SearchApiResponse = (options: {
  content: Record<string, unknown>;
}): ConverseEvent => ({
  event: 'search_api_response',
  data: options.content,
});

function textMessage(
  messageId: string,
  text: string,
  chunkSize = 4
): ConverseEvent[] {
  const events: ConverseEvent[] = [TextMessageStart({messageId})];

  const words = text.split(' ');
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    const delta = i === 0 ? chunk : ` ${chunk}`;
    events.push(TextMessageContent({messageId, delta}));
  }

  events.push(TextMessageEnd({messageId}));
  return events;
}

function toolCall(options: {
  toolCallId: string;
  toolCallName: string;
  parentMessageId: string;
  args: Record<string, unknown>;
  resultMessageId: string;
  resultContent: string;
}): ConverseEvent[] {
  return [
    ToolCallStart({
      toolCallId: options.toolCallId,
      toolCallName: options.toolCallName,
      parentMessageId: options.parentMessageId,
    }),
    ToolCallArgs({
      toolCallId: options.toolCallId,
      delta: JSON.stringify(options.args),
    }),
    ToolCallEnd({toolCallId: options.toolCallId}),
    ToolCallResult({
      messageId: options.resultMessageId,
      toolCallId: options.toolCallId,
      content: options.resultContent,
    }),
  ];
}

function encodeSSEEvent(converseEvent: ConverseEvent): string {
  return `event:${converseEvent.event}\ndata:${JSON.stringify(converseEvent.data)}\n\n`;
}

function buildStreamingResponse(
  events: ConverseEvent[],
  {
    delayBetweenMessages = DEFAULT_DELAY_MS,
  }: {delayBetweenMessages?: number | 'real' | 'infinite'} = {}
) {
  const resolvedDelay =
    delayBetweenMessages === 'real'
      ? DEFAULT_DELAY_MS
      : delayBetweenMessages === 'infinite'
        ? Number.POSITIVE_INFINITY
        : delayBetweenMessages;

  const stream = new ReadableStream({
    async start(controller) {
      for (const event of events) {
        const eventDelay = event.delayMs ?? resolvedDelay;
        await delay(eventDelay);
        controller.enqueue(new TextEncoder().encode(encodeSSEEvent(event)));
      }
      controller.close();
    },
  });

  return new HttpResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

function simpleConversation(options: {
  text: string;
  threadId?: string;
  runId?: string;
}): ConverseEvent[] {
  const threadId = options.threadId ?? DEFAULT_THREAD_ID;
  const runId = options.runId ?? generateRunId();
  const messageId = `msg-${Date.now().toString(36)}`;

  return [
    TurnStarted(),
    RunStarted({threadId, runId}),
    StateSnapshot(),
    ...textMessage(messageId, options.text),
    StateSnapshot(),
    RunFinished({threadId, runId}),
    TurnComplete(),
  ];
}

export {
  TurnStarted,
  TurnComplete,
  RunStarted,
  RunFinished,
  StateSnapshot,
  TextMessageStart,
  TextMessageContent,
  TextMessageEnd,
  ToolCallStart,
  ToolCallArgs,
  ToolCallEnd,
  ToolCallResult,
  ActivitySnapshot,
  CommerceSearchApiResponse,
  SearchApiResponse,
  textMessage,
  toolCall,
  simpleConversation,
  buildStreamingResponse,
  encodeSSEEvent,
};
export type {ConverseEvent, ConverseEventType, MessageData, TurnStartedData};
