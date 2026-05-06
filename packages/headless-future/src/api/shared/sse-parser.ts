/**
 * Layer 1: SSE Event Normalizer
 *
 * Transforms raw SSE {event, data} pairs into typed NormalizedStreamEvent objects.
 * Ported and adapted from barca-sports-hydrogen sse-parser.ts.
 *
 * Design principles:
 * - Never throws; always returns a typed event (falls back to UnknownEvent)
 * - Downstream controllers and reducers can use exhaustive switch statements
 */

import type {NormalizedStreamEvent, RawSSEEvent} from './stream-types.js';

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizePayload(fallbackName: string, payload: unknown): unknown {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.type === 'string') {
      return record;
    }
  }

  if (fallbackName && fallbackName !== 'message') {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      // Named SSE lifecycle events (e.g. turn_started) carry structured objects
      // without an embedded `type`. Promote to first-class typed events.
      return {
        ...(payload as Record<string, unknown>),
        type: fallbackName,
      };
    }

    return {type: fallbackName, payload};
  }

  return payload;
}

function coerceToNormalizedEvent(
  value: unknown,
  fallbackEvent: string,
  fallbackPayload: unknown
): NormalizedStreamEvent {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const type = readTrimmedString(record.type);
    if (type) {
      if (type === 'CUSTOM') {
        const name = readTrimmedString(record.name) ?? 'custom';
        const eventValue =
          'value' in record
            ? record.value
            : 'payload' in record
              ? record.payload
              : record;
        return {type: 'CUSTOM', name, value: eventValue};
      }
      // Return as-is; TypeScript will narrow at call sites
      return record as NormalizedStreamEvent;
    }
  }

  return {
    type: 'UNKNOWN',
    event: fallbackEvent,
    payload: value ?? fallbackPayload,
  };
}

/**
 * Parse a raw SSE event into a typed NormalizedStreamEvent.
 *
 * @example
 * ```ts
 * const processor = createBufferProcessor((raw) => {
 *   const event = parseSSEEvent(raw);
 *   dispatch(event);
 * });
 * ```
 */
export function parseSSEEvent(raw: RawSSEEvent): NormalizedStreamEvent {
  let parsedPayload: unknown = raw.data;

  if (raw.data) {
    try {
      parsedPayload = JSON.parse(raw.data);
    } catch {
      parsedPayload = raw.data;
    }
  }

  const normalized = normalizePayload(raw.event || 'message', parsedPayload);
  return coerceToNormalizedEvent(
    normalized,
    raw.event || 'message',
    parsedPayload
  );
}
