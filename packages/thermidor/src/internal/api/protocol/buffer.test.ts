import {describe, it, expect, vi} from 'vitest';
import {createBufferProcessor} from './buffer.js';
import type {RawSSEEvent} from './stream-types.js';

describe('createBufferProcessor', () => {
  it('parses a complete event from a single chunk', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: message\ndata: hello\n\n');

    expect(onEvent).toHaveBeenCalledWith({event: 'message', data: 'hello'});
  });

  it('handles CRLF boundaries', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: test\r\ndata: value\r\n\r\n');

    expect(onEvent).toHaveBeenCalledWith({event: 'test', data: 'value'});
  });

  it('buffers partial chunks until boundary', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: msg\n');
    expect(onEvent).not.toHaveBeenCalled();

    processor.processChunk('data: partial\n\n');
    expect(onEvent).toHaveBeenCalledWith({event: 'msg', data: 'partial'});
  });

  it('handles multiple events in one chunk', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: a\ndata: 1\n\nevent: b\ndata: 2\n\n');

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenCalledWith({event: 'a', data: '1'});
    expect(onEvent).toHaveBeenCalledWith({event: 'b', data: '2'});
  });

  it('flush processes remaining buffer', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: last\ndata: end');
    expect(onEvent).not.toHaveBeenCalled();

    processor.flush();
    expect(onEvent).toHaveBeenCalledWith({event: 'last', data: 'end'});
  });

  it('flush does nothing on empty buffer', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.flush();
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('reset clears the buffer', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('event: partial\ndata: x');
    processor.reset();
    processor.flush();

    expect(onEvent).not.toHaveBeenCalled();
  });

  it('ignores comment lines', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk(':comment\nevent: msg\ndata: val\n\n');

    expect(onEvent).toHaveBeenCalledWith({event: 'msg', data: 'val'});
  });

  it('defaults event type to message', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('data: only-data\n\n');

    expect(onEvent).toHaveBeenCalledWith({event: 'message', data: 'only-data'});
  });

  it('joins multiple data lines', () => {
    const onEvent = vi.fn();
    const processor = createBufferProcessor(onEvent);

    processor.processChunk('data: line1\ndata: line2\n\n');

    expect(onEvent).toHaveBeenCalledWith({
      event: 'message',
      data: 'line1\nline2',
    });
  });
});

describe('SSE spec compliance', () => {
  it('handles a realistic SSE stream with typed events', () => {
    const events: RawSSEEvent[] = [];
    const processor = createBufferProcessor((e) => events.push(e));

    processor.processChunk(
      'event: TEXT_MESSAGE_CONTENT\ndata: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"Hello"}\n\n' +
        'event: TEXT_MESSAGE_CONTENT\ndata: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":" world"}\n\n'
    );

    expect(events).toHaveLength(2);
    expect(JSON.parse(events[0].data)).toEqual({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'm1',
      delta: 'Hello',
    });
    expect(JSON.parse(events[1].data)).toEqual({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'm1',
      delta: ' world',
    });
  });

  it('handles stream arriving byte-by-byte', () => {
    const events: RawSSEEvent[] = [];
    const processor = createBufferProcessor((e) => events.push(e));
    const full = 'event: done\ndata: {"type":"RUN_FINISHED"}\n\n';

    for (const char of full) {
      processor.processChunk(char);
    }

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({event: 'done', data: '{"type":"RUN_FINISHED"}'});
  });

  it('handles keep-alive comments between events', () => {
    const events: RawSSEEvent[] = [];
    const processor = createBufferProcessor((e) => events.push(e));

    processor.processChunk(
      'data: first\n\n' + ':keep-alive\n\n' + 'data: second\n\n'
    );

    expect(events).toHaveLength(3);
    expect(events[0].data).toBe('first');
    expect(events[1]).toEqual({event: 'message', data: ''});
    expect(events[2].data).toBe('second');
  });

  it('handles multiline JSON data split across data fields', () => {
    const events: RawSSEEvent[] = [];
    const processor = createBufferProcessor((e) => events.push(e));

    processor.processChunk(
      'event: message\ndata: {"type":"STATE_SNAPSHOT",\ndata: "snapshot":{}}\n\n'
    );

    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('{"type":"STATE_SNAPSHOT",\n"snapshot":{}}');
  });
});
