import {readConversationEventStream} from '@/src/internal/api/conversation/index.js';
import type {CommerceSearchResponse} from '@/src/internal/api/commerce-search/index.js';

export function extractCommerceSearchResponseFromStream(
  stream: ReadableStream<Uint8Array>
): Promise<CommerceSearchResponse> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    readConversationEventStream({
      stream,
      onEvent: (event) => {
        if (resolved) {
          return;
        }

        if (event.type === 'commerce_search_api_response') {
          resolved = true;
          const {type: _, ...payload} = event;
          resolve(payload as unknown as CommerceSearchResponse);
        } else if (event.type === 'RUN_ERROR') {
          resolved = true;
          const message =
            'message' in event && event.message
              ? event.message
              : 'A run error occurred during the converse stream';
          reject(new Error(message));
        }
      },
      onDone: () => {
        if (!resolved) {
          reject(
            new Error('No search response received from the converse stream')
          );
        }
      },
      onError: (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      },
    });
  });
}
