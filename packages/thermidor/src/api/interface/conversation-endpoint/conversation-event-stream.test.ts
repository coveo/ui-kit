import {beforeEach, describe, expect, it, vi} from 'vitest';
import {readConversationEventStream} from './conversation-event-stream.js';

const {mockReadEventStream, mockParseSSEEvent} = vi.hoisted(() => {
  return {
    mockReadEventStream: vi.fn(),
    mockParseSSEEvent: vi.fn(),
  };
});

vi.mock('@/src/api/internal/protocol/stream.js', () => {
  return {
    readEventStream: mockReadEventStream,
  };
});

vi.mock('@/src/api/internal/protocol/sse-parser.js', () => {
  return {
    parseSSEEvent: mockParseSSEEvent,
  };
});

describe('readConversationEventStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes raw stream events before invoking onEvent', async () => {
    const stream = {} as ReadableStream<Uint8Array>;
    const onEvent = vi.fn();
    const normalizedEvent = {type: 'turn_complete'};

    mockParseSSEEvent.mockReturnValue(normalizedEvent);
    mockReadEventStream.mockImplementation(
      async ({onEvent: onRawEvent, onDone}) => {
        onRawEvent({event: 'turn_complete', data: '{}'});
        onDone?.();
      }
    );

    await readConversationEventStream({stream, onEvent});

    expect(mockParseSSEEvent).toHaveBeenCalledWith({
      event: 'turn_complete',
      data: '{}',
    });
    expect(onEvent).toHaveBeenCalledWith(normalizedEvent);
  });

  it('forwards signal and terminal callbacks to the underlying reader', async () => {
    const stream = {} as ReadableStream<Uint8Array>;
    const signal = new AbortController().signal;
    const onEvent = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    mockReadEventStream.mockResolvedValue(undefined);

    await readConversationEventStream({
      stream,
      signal,
      onEvent,
      onDone,
      onError,
    });

    expect(mockReadEventStream).toHaveBeenCalledWith(
      expect.objectContaining({
        stream,
        signal,
        onDone,
        onError,
        onEvent: expect.any(Function),
      })
    );
  });
});
