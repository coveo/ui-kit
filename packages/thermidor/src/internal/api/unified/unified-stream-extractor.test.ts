import {beforeEach, describe, expect, it, vi} from 'vitest';
import {extractUpdateDataModelOperationsFromStream} from './unified-stream-extractor.js';

const {mockReadEventStream, mockParseSSEEvent} = vi.hoisted(() => {
  return {
    mockReadEventStream: vi.fn(),
    mockParseSSEEvent: vi.fn(),
  };
});

vi.mock('@/src/internal/api/protocol/stream.js', () => {
  return {
    readEventStream: mockReadEventStream,
  };
});

vi.mock('@/src/internal/api/protocol/sse-parser.js', () => {
  return {
    parseSSEEvent: mockParseSSEEvent,
  };
});

describe('extractUpdateDataModelOperationsFromStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseSSEEvent.mockImplementation((raw) => raw);
  });

  it('returns empty array when stream has no ACTIVITY_SNAPSHOT events', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({type: 'RUN_STARTED'});
      onEvent({type: 'RUN_FINISHED'});
      onDone?.();
    });

    const result = await extractUpdateDataModelOperationsFromStream(stream);

    expect(result).toEqual([]);
  });

  it('extracts updateDataModel operations from a2ui-surface snapshots', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/products', value: [{id: '1'}]},
            },
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/pagination', value: {page: 2}},
            },
          ],
        },
      });
      onDone?.();
    });

    const result = await extractUpdateDataModelOperationsFromStream(stream);

    expect(result).toEqual([
      {path: '/products', value: [{id: '1'}]},
      {path: '/pagination', value: {page: 2}},
    ]);
  });

  it('ignores non-a2ui-surface ACTIVITY_SNAPSHOT events', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'some-other-activity',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/ignored', value: 'data'},
            },
          ],
        },
      });
      onDone?.();
    });

    const result = await extractUpdateDataModelOperationsFromStream(stream);

    expect(result).toEqual([]);
  });

  it('collects updates from multiple snapshots in order', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onEvent, onDone}) => {
      onEvent({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/first', value: 1},
            },
          ],
        },
      });
      onEvent({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/second', value: 2},
            },
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 's1', path: '/third', value: 3},
            },
          ],
        },
      });
      onDone?.();
    });

    const result = await extractUpdateDataModelOperationsFromStream(stream);

    expect(result).toEqual([
      {path: '/first', value: 1},
      {path: '/second', value: 2},
      {path: '/third', value: 3},
    ]);
  });

  it('rejects on RUN_ERROR event', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onEvent}) => {
      onEvent({type: 'RUN_ERROR', message: 'Something went wrong'});
    });

    await expect(extractUpdateDataModelOperationsFromStream(stream)).rejects.toThrow(
      'Something went wrong'
    );
  });

  it('rejects on stream error', async () => {
    const stream = {} as ReadableStream<Uint8Array>;

    mockReadEventStream.mockImplementation(async ({onError}) => {
      const error = new Error('Stream failed');
      onError?.(error);
      throw error;
    });

    await expect(extractUpdateDataModelOperationsFromStream(stream)).rejects.toThrow(
      'Stream failed'
    );
  });
});
