import {describe, expect, it, vi} from 'vitest';
import type {
  StreamRequest,
  TransportAdapter,
} from '@/src/api/adapters/types.js';
import {executeConverseStream} from './execute-converse-stream.js';

const encoder = new TextEncoder();

type StreamScript = (request: StreamRequest) => Promise<void> | void;

function createScriptedTransport(script: StreamScript): TransportAdapter {
  return {
    send: vi.fn(async () => ({status: 200, data: {}})),
    openStream: vi.fn(async (request) => {
      await script(request);
    }),
    abort: vi.fn(),
  };
}

describe('executeConverseStream', () => {
  it('parses events across chunk boundaries', async () => {
    const events: string[] = [];
    const transport = createScriptedTransport((request) => {
      request.onChunk(
        encoder.encode('event: message\ndata: {"type":"TEXT_MESSAGE_CONTENT",')
      );
      request.onChunk(encoder.encode('"messageId":"m1","delta":"hello"}\n\n'));
      request.onClose();
    });

    await executeConverseStream({
      transport,
      body: {query: 'hello'},
      callbacks: {
        onNormalizedEvent: (event) => events.push(event.type),
      },
    });

    expect(events).toContain('TEXT_MESSAGE_CONTENT');
  });

  it('returns completed when terminal event is observed', async () => {
    const transport = createScriptedTransport((request) => {
      request.onChunk(
        encoder.encode(
          'event: message\ndata: {"type":"RUN_FINISHED","threadId":"t","runId":"r"}\n\n'
        )
      );
      request.onClose();
    });

    const outcome = await executeConverseStream({
      transport,
      body: {query: 'hello'},
    });

    expect(outcome.kind).toBe('completed');
  });

  it('maps aborted stream to aborted outcome', async () => {
    const controller = new AbortController();
    controller.abort('user');

    const transport = createScriptedTransport(async () => undefined);

    const outcome = await executeConverseStream({
      transport,
      body: {query: 'hello'},
      signal: controller.signal,
    });

    expect(outcome.kind).toBe('aborted');
  });

  it('maps transport callback errors to transport_error outcome', async () => {
    const transport = createScriptedTransport((request) => {
      request.onError({code: 'NETWORK_ERROR', message: 'no network'});
    });

    const outcome = await executeConverseStream({
      transport,
      body: {query: 'hello'},
    });

    expect(outcome).toEqual({
      kind: 'transport_error',
      code: 'NETWORK_ERROR',
      message: 'no network',
    });
  });

  it('surfaces unknown events and emits lifecycle callbacks in order', async () => {
    const lifecycle: string[] = [];
    const unknowns: string[] = [];

    const transport = createScriptedTransport((request) => {
      request.onChunk(encoder.encode('event: message\ndata: plain-text\n\n'));
      request.onClose();
    });

    await executeConverseStream({
      transport,
      body: {query: 'hello'},
      callbacks: {
        onLifecycle: (event) => lifecycle.push(event.type),
        onUnknownEvent: (event) => unknowns.push(event.type),
      },
    });

    expect(lifecycle).toEqual(['opened', 'closed']);
    expect(unknowns).toEqual(['UNKNOWN']);
  });

  it('returns protocol_error when run error event is streamed', async () => {
    const transport = createScriptedTransport((request) => {
      request.onChunk(
        encoder.encode(
          'event: message\ndata: {"type":"RUN_ERROR","code":"MODEL_FAIL","message":"boom"}\n\n'
        )
      );
      request.onClose();
    });

    const outcome = await executeConverseStream({
      transport,
      body: {query: 'hello'},
    });

    expect(outcome).toEqual({
      kind: 'protocol_error',
      code: 'MODEL_FAIL',
      message: 'boom',
    });
  });
});
