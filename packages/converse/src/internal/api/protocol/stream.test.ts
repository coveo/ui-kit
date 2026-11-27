import {describe, expect, it, vi} from 'vitest';
import {readEventStream} from './stream.js';
import type {RawSSEEvent} from './stream-types.js';

function createStreamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('readEventStream()', () => {
  it('should parse and emit raw SSE', async () => {
    const events: RawSSEEvent[] = [];

    await readEventStream({
      stream: createStreamFromChunks([
        'event: chunk\n',
        'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"hel',
        'lo"}\n\n',
        'data: plain-message\n\n',
      ]),
      onEvent: (event) => events.push(event),
    });

    expect(events).toEqual([
      {
        event: 'chunk',
        data: '{"type":"TEXT_MESSAGE_CONTENT","delta":"hello"}',
      },
      {
        event: 'message',
        data: 'plain-message',
      },
    ]);
  });

  it('should call onDone when stream is fully consumed', async () => {
    const onDone = vi.fn();

    await readEventStream({
      stream: createStreamFromChunks(['data: done\n\n']),
      onEvent: vi.fn(),
      onDone,
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('should propagate AbortError when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const onError = vi.fn();

    await expect(
      readEventStream({
        stream: createStreamFromChunks(['data: ignored\n\n']),
        onEvent: vi.fn(),
        signal: controller.signal,
        onError,
      })
    ).rejects.toMatchObject({name: 'AbortError'});

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
