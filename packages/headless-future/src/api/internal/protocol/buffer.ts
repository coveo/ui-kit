/**
 * Layer 1: SSE Buffer Processor
 *
 * Processes raw byte chunks into discrete SSE event strings.
 * Ported and adapted from barca-sports-hydrogen buffer.ts.
 *
 * Handles both LF (\n\n) and CRLF (\r\n\r\n) event boundaries.
 */

import type {RawSSEEvent} from './stream-types.js';

export type EventProcessor = (event: RawSSEEvent) => void;

function findEventBoundary(buffer: string): number {
  const lfIndex = buffer.indexOf('\n\n');
  const crlfIndex = buffer.indexOf('\r\n\r\n');
  if (lfIndex === -1) return crlfIndex;
  if (crlfIndex === -1) return lfIndex;
  return Math.min(lfIndex, crlfIndex);
}

function getBoundaryLength(buffer: string, index: number): number {
  return buffer.startsWith('\r\n\r\n', index) ? 4 : 2;
}

function parseRawEvent(rawEvent: string): RawSSEEvent | null {
  if (!rawEvent.trim()) return null;

  const lines = rawEvent.split(/\r?\n/);
  let eventType = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;

    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  return {
    event: eventType,
    data: dataLines.join('\n'),
  };
}

/**
 * Creates a stateful buffer processor that accumulates raw SSE bytes and
 * dispatches parsed events to the provided callback.
 *
 * @example
 * ```ts
 * const processor = createBufferProcessor((event) => {
 *   const normalized = parseSSEEvent(event);
 *   engine.mutate(applyStreamEvent(normalized));
 * });
 *
 * transport.openStream({ onChunk: (chunk) => {
 *   processor.processChunk(new TextDecoder().decode(chunk));
 * }});
 * ```
 */
export function createBufferProcessor(onEvent: EventProcessor) {
  let buffer = '';

  const processRawEvent = (rawEvent: string) => {
    const parsed = parseRawEvent(rawEvent);
    if (parsed) onEvent(parsed);
  };

  const extractAndProcessEvents = () => {
    while (true) {
      const boundaryIndex = findEventBoundary(buffer);
      if (boundaryIndex === -1) break;

      const delimiterLength = getBoundaryLength(buffer, boundaryIndex);
      const rawEvent = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + delimiterLength);

      processRawEvent(rawEvent);
    }
  };

  return {
    processChunk(chunk: string) {
      buffer += chunk;
      extractAndProcessEvents();
    },

    /** Call after the stream closes to process any remaining buffered data */
    flush() {
      if (buffer.trim()) {
        processRawEvent(buffer);
        buffer = '';
      }
    },

    reset() {
      buffer = '';
    },
  };
}
