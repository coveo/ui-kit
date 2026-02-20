import {describe, expect, it} from 'vitest';
import {parseSSEStream} from './sse-parser.js';

/**
 * Creates a ReadableStream from an array of string chunks
 * and returns the reader.
 */
function readerFromChunks(
  chunks: string[]
): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return stream.getReader();
}

async function collectEvents(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<unknown[]> {
  const events: unknown[] = [];
  for await (const event of parseSSEStream(reader)) {
    events.push(event);
  }
  return events;
}

describe('parseSSEStream', () => {
  it('should parse a single SSE event', async () => {
    const reader = readerFromChunks([
      'data: {"type":"RUN_STARTED","runId":"r1"}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });

  it('should parse multiple SSE events in one chunk', async () => {
    const reader = readerFromChunks([
      'data: {"type":"RUN_STARTED","runId":"r1"}\n\n' +
        'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"Hello"}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({type: 'RUN_STARTED', runId: 'r1'});
    expect(events[1]).toEqual({
      type: 'TEXT_MESSAGE_CONTENT',
      delta: 'Hello',
    });
  });

  it('should handle events split across multiple chunks', async () => {
    const reader = readerFromChunks([
      'data: {"type":"RUN_STA',
      'RTED","runId":"r1"}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });

  it('should handle multi-line data events', async () => {
    const reader = readerFromChunks([
      'data: {"type":"CUSTOM",\n' + 'data: "name":"test","value":42}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toEqual([{type: 'CUSTOM', name: 'test', value: 42}]);
  });

  it('should ignore non-data fields', async () => {
    const reader = readerFromChunks([
      'event: message\nid: 1\nretry: 5000\ndata: {"type":"RUN_STARTED","runId":"r1"}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });

  it('should handle empty stream', async () => {
    const reader = readerFromChunks([]);
    const events = await collectEvents(reader);
    expect(events).toEqual([]);
  });

  it('should handle trailing data after last double newline', async () => {
    const reader = readerFromChunks([
      'data: {"type":"RUN_STARTED","runId":"r1"}\n\n' +
        'data: {"type":"RUN_FINISHED","runId":"r1"}',
    ]);

    const events = await collectEvents(reader);
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual({type: 'RUN_FINISHED', runId: 'r1'});
  });

  it('should remove optional space after data: prefix', async () => {
    const reader = readerFromChunks([
      'data:{"type":"RUN_STARTED","runId":"r1"}\n\n',
    ]);

    const events = await collectEvents(reader);
    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });
});
