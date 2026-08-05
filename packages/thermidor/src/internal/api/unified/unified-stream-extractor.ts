import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import type {RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import {extractA2uiOperations} from './unified-surface-hydration.js';

export interface ExtractedUpdate {
  path: string | undefined;
  value: unknown;
}

export async function extractUpdateDataModelOperationsFromStream(
  stream: ReadableStream<Uint8Array>
): Promise<ExtractedUpdate[]> {
  const updates: ExtractedUpdate[] = [];

  return new Promise<ExtractedUpdate[]>((resolve, reject) => {
    readEventStream({
      stream,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);

        if (event.type === 'RUN_ERROR') {
          reject(new Error(event.message || 'A run error occurred.'));
          return;
        }

        if (event.type !== 'ACTIVITY_SNAPSHOT' || event.activityType !== 'a2ui-surface') {
          return;
        }

        const operations = extractA2uiOperations(event.content as Record<string, unknown>);
        for (const op of operations) {
          if ('updateDataModel' in op) {
            updates.push({path: op.updateDataModel.path, value: op.updateDataModel.value});
          }
        }
      },
      onDone: () => resolve(updates),
      onError: (error) => reject(error instanceof Error ? error : new Error(String(error))),
    }).catch(reject);
  });
}
