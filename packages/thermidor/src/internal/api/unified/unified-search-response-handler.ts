import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {extractUpdateDataModelOperationsFromStream} from './unified-stream-extractor.js';
import {applyDataModelUpdate} from './unified-surface-hydration.js';

export function createUnifiedSearchResponseHandler(iface: InterfaceHandle) {
  return async function handleResponse(
    engine: FullEngine,
    stream: ReadableStream<Uint8Array>
  ): Promise<void> {
    const updates = await extractUpdateDataModelOperationsFromStream(stream);
    for (const update of updates) {
      applyDataModelUpdate(engine, iface, update.path, update.value);
    }
  };
}
