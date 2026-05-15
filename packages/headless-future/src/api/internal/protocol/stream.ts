/**
 * Layer 1: Stream Utilities
 *
 * Consumes a ReadableStream of SSE bytes and emits parsed raw SSE frames.
 * This utility is transport-level and intentionally domain agnostic.
 */

import {createBufferProcessor} from './buffer.js';
import type {RawSSEEvent} from './stream-types.js';

export interface ReadEventStreamOptions {
  stream: ReadableStream<Uint8Array>;
  onEvent: (event: RawSSEEvent) => void;
  signal?: AbortSignal;
  onDone?: () => void;
  onError?: (error: unknown) => void;
}

function createAbortError(reason?: unknown): Error {
  if (reason instanceof Error) {
    if (!reason.name || reason.name === 'Error') {
      if (typeof DOMException !== 'undefined') {
        return new DOMException(reason.message, 'AbortError');
      }
      const fallback = new Error(reason.message);
      fallback.name = 'AbortError';
      return fallback;
    }
    return reason;
  }

  if (typeof DOMException !== 'undefined') {
    return new DOMException('The operation was aborted.', 'AbortError');
  }

  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

/**
 * Read an SSE byte stream and invoke callbacks with parsed raw events.
 */
export async function readEventStream({
  stream,
  onEvent,
  signal,
  onDone,
  onError,
}: ReadEventStreamOptions): Promise<void> {
  if (signal?.aborted) {
    const error = createAbortError(signal.reason);
    onError?.(error);
    throw error;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const processor = createBufferProcessor(onEvent);

  const handleAbort = () => {
    void reader.cancel(createAbortError(signal?.reason));
  };

  if (signal) {
    signal.addEventListener('abort', handleAbort, {once: true});
  }

  try {
    while (true) {
      if (signal?.aborted) {
        throw createAbortError(signal.reason);
      }

      const {done, value} = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        processor.processChunk(decoder.decode(value, {stream: true}));
      }
    }

    const trailing = decoder.decode();
    if (trailing) {
      processor.processChunk(trailing);
    }
    processor.flush();
    onDone?.();
  } catch (error) {
    onError?.(error);
    throw error;
  } finally {
    if (signal) {
      signal.removeEventListener('abort', handleAbort);
    }
    reader.releaseLock();
  }
}
