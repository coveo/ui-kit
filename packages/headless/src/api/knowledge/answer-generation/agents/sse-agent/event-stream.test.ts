import type {BaseEvent} from '@ag-ui/core';
import {describe, expect, it} from 'vitest';
import {readEventStream} from './event-stream.js';

const streamFromChunks = (chunks: (string | Uint8Array)[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      }
      controller.close();
    },
  });
};

const collectEvents = async (chunks: (string | Uint8Array)[]) => {
  const events: BaseEvent[] = [];
  await readEventStream(streamFromChunks(chunks), (event) => events.push(event));
  return events;
};

describe('#readEventStream', () => {
  it('parses a single event', async () => {
    const events = await collectEvents(['data: {"type":"RUN_STARTED","runId":"r1"}\n\n']);

    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });

  it('parses several events from one chunk, in order', async () => {
    const events = await collectEvents([
      'data: {"type":"RUN_STARTED","runId":"r1"}\n\n' +
        'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"Hello"}\n\n',
    ]);

    expect(events).toEqual([
      {type: 'RUN_STARTED', runId: 'r1'},
      {type: 'TEXT_MESSAGE_CONTENT', delta: 'Hello'},
    ]);
  });

  it('parses an event split across chunks in the middle of a line', async () => {
    const events = await collectEvents(['data: {"type":"RUN_STA', 'RTED","runId":"r1"}\n', '\n']);

    expect(events).toEqual([{type: 'RUN_STARTED', runId: 'r1'}]);
  });

  it('parses a multi-byte character split across chunks', async () => {
    const bytes = new TextEncoder().encode('data: {"delta":"é"}\n\n');
    const splitIndex = bytes.indexOf(0xc3) + 1;

    const events = await collectEvents([bytes.slice(0, splitIndex), bytes.slice(splitIndex)]);

    expect(events).toEqual([{delta: 'é'}]);
  });

  it('joins multi-line data with newlines', async () => {
    const events = await collectEvents([
      'data: {"type":"CUSTOM",\ndata: "name":"test","value":42}\n\n',
    ]);

    expect(events).toEqual([{type: 'CUSTOM', name: 'test', value: 42}]);
  });

  it('supports CRLF and CR line endings', async () => {
    const events = await collectEvents([
      'data: {"type":"RUN_STARTED"}\r\n\r\n',
      'data: {"type":"RUN_FINISHED"}\r\r',
    ]);

    expect(events).toEqual([{type: 'RUN_STARTED'}, {type: 'RUN_FINISHED'}]);
  });

  it('supports a CRLF split between chunks', async () => {
    const events = await collectEvents(['data: {"type":"RUN_STARTED"}\r', '\n\r', '\n']);

    expect(events).toEqual([{type: 'RUN_STARTED'}]);
  });

  it('ignores the event, id and retry fields and comments', async () => {
    const events = await collectEvents([
      ': keep-alive\nevent: message\nid: 1\nretry: 5000\ndata: {"type":"RUN_STARTED"}\n\n',
    ]);

    expect(events).toEqual([{type: 'RUN_STARTED'}]);
  });

  it('ignores frames without data', async () => {
    const events = await collectEvents([
      ': ping\n\nevent: noop\n\n\n\ndata: {"type":"RUN_STARTED"}\n\n',
    ]);

    expect(events).toEqual([{type: 'RUN_STARTED'}]);
  });

  it('accepts data without a space after the colon', async () => {
    const events = await collectEvents(['data:{"type":"RUN_STARTED"}\n\n']);

    expect(events).toEqual([{type: 'RUN_STARTED'}]);
  });

  it('resolves without events for an empty stream', async () => {
    expect(await collectEvents([])).toEqual([]);
  });

  it('dispatches a last frame that is not terminated by a blank line', async () => {
    const events = await collectEvents([
      'data: {"type":"RUN_STARTED"}\n\ndata: {"type":"RUN_FINISHED"}',
    ]);

    expect(events).toEqual([{type: 'RUN_STARTED'}, {type: 'RUN_FINISHED'}]);
  });

  it('dispatches each event once when the stream ends with a blank line', async () => {
    const events = await collectEvents(['data: {"type":"RUN_STARTED"}\n\n']);

    expect(events).toHaveLength(1);
  });

  it('rejects when a frame is not valid JSON', async () => {
    await expect(collectEvents(['data: not json\n\n'])).rejects.toThrow(SyntaxError);
  });
});
