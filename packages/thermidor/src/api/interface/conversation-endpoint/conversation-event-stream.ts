import {parseSSEEvent} from '@/src/api/internal/protocol/sse-parser.js';
import {readEventStream} from '@/src/api/internal/protocol/stream.js';
import type {NormalizedStreamEvent} from '@/src/api/internal/protocol/stream-types.js';

export type ConversationStreamEvent = NormalizedStreamEvent;

export interface ReadConversationEventStreamOptions {
  stream: ReadableStream<Uint8Array>;
  onEvent: (event: ConversationStreamEvent) => void;
  signal?: AbortSignal;
  onDone?: () => void;
  onError?: (error: unknown) => void;
}

export async function readConversationEventStream({
  stream,
  onEvent,
  signal,
  onDone,
  onError,
}: ReadConversationEventStreamOptions): Promise<void> {
  await readEventStream({
    stream,
    signal,
    onDone,
    onError,
    onEvent: (rawEvent) => {
      onEvent(parseSSEEvent(rawEvent));
    },
  });
}
