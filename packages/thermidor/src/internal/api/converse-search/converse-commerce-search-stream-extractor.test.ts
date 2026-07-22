import {beforeEach, describe, expect, it, vi} from 'vitest';
import {extractCommerceSearchResponseFromStream} from './converse-commerce-search-stream-extractor.js';

const {mockReadConversationEventStream} = vi.hoisted(() => {
  return {
    mockReadConversationEventStream: vi.fn(),
  };
});

vi.mock('@/src/internal/api/conversation/index.js', () => {
  return {
    readConversationEventStream: mockReadConversationEventStream,
  };
});

describe('extractCommerceSearchResponseFromStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves on first commerce_search_api_response among mixed events', async () => {
    const expectedPayload = {
      products: [{id: '1', name: 'Product A'}],
      pagination: {totalEntries: 1},
    };

    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'turn_started', conversationSessionId: 'abc'});
        onEvent({type: 'TEXT_MESSAGE_CONTENT', content: 'hello'});
        onEvent({type: 'commerce_search_api_response', ...expectedPayload});
        onEvent({
          type: 'commerce_search_api_response',
          products: [{id: '2'}],
          pagination: {totalEntries: 2},
        });
        onDone?.();
      }
    );

    const stream = {} as ReadableStream<Uint8Array>;
    const result = await extractCommerceSearchResponseFromStream(stream);

    expect(result).toEqual(expectedPayload);
  });

  it('rejects with message on RUN_ERROR before search response', async () => {
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'turn_started'});
        onEvent({type: 'RUN_ERROR', message: 'Agent execution failed'});
        onDone?.();
      }
    );

    const stream = {} as ReadableStream<Uint8Array>;
    await expect(
      extractCommerceSearchResponseFromStream(stream)
    ).rejects.toThrow('Agent execution failed');
  });

  it('rejects with default message when RUN_ERROR has empty message', async () => {
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'RUN_ERROR', message: ''});
        onDone?.();
      }
    );

    const stream = {} as ReadableStream<Uint8Array>;
    await expect(
      extractCommerceSearchResponseFromStream(stream)
    ).rejects.toThrow('A run error occurred during the converse stream');
  });

  it('rejects when stream ends without relevant event', async () => {
    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onDone}) => {
        onEvent({type: 'turn_started'});
        onEvent({type: 'TEXT_MESSAGE_CONTENT', content: 'hello'});
        onEvent({type: 'turn_complete'});
        onDone?.();
      }
    );

    const stream = {} as ReadableStream<Uint8Array>;
    await expect(
      extractCommerceSearchResponseFromStream(stream)
    ).rejects.toThrow('No search response received from the converse stream');
  });

  it('rejects on stream error propagation', async () => {
    const networkError = new Error('Network connection lost');

    mockReadConversationEventStream.mockImplementation(
      async ({onEvent, onError}) => {
        onEvent({type: 'turn_started'});
        onError?.(networkError);
      }
    );

    const stream = {} as ReadableStream<Uint8Array>;
    await expect(extractCommerceSearchResponseFromStream(stream)).rejects.toBe(
      networkError
    );
  });
});
