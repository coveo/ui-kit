/**
 * Layer 1: SSE Event Normalizer
 *
 * Transforms raw SSE {event, data} pairs into typed NormalizedStreamEvent objects.
 * Uses @ag-ui/core schemas for validation with fallback to Coveo-specific events.
 *
 * Design principles:
 * - Never throws; always returns a typed event (falls back to UnknownEvent)
 * - Downstream controllers and reducers can use exhaustive switch statements
 */

import {EventSchemas} from '@ag-ui/core';
import type {NormalizedStreamEvent, RawSSEEvent} from './stream-types.js';

/**
 * Handle named SSE events that carry their type in the SSE `event:` field
 * rather than in the JSON payload (e.g. `turn_started`, `turn_complete`).
 *
 * For structured payloads, promotes the event name into the `type` field.
 * For non-object payloads, wraps them with a `type` and `payload` field.
 */
function normalizeNamedEvent(eventName: string, payload: unknown): NormalizedStreamEvent {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return {
      ...(payload as Record<string, unknown>),
      type: eventName,
    } as NormalizedStreamEvent;
  }

  return {type: eventName, payload} as unknown as NormalizedStreamEvent;
}

/**
 * Parse a raw SSE event into a typed NormalizedStreamEvent.
 *
 * Validation order:
 * 1. JSON-parse the data field
 * 2. Attempt AG-UI schema validation (covers all standard event types)
 * 3. Fall back to Coveo-specific event promotion (turn_started, turn_complete)
 * 4. Fall back to UnknownEvent
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
      // Non-JSON payloads are handled below
      parsedPayload = raw.data;
    }
  }

  // If the payload is an object with a `type` field, try AG-UI schema validation
  if (parsedPayload && typeof parsedPayload === 'object') {
    const record = parsedPayload as Record<string, unknown>;
    if (typeof record.type === 'string') {
      const result = EventSchemas.safeParse(parsedPayload);
      if (result.success) {
        return result.data as NormalizedStreamEvent;
      }

      // CUSTOM events that failed Zod validation — handle gracefully
      if (record.type === 'CUSTOM') {
        const name =
          typeof record.name === 'string' && record.name.trim() ? record.name.trim() : 'custom';
        const value =
          'value' in record ? record.value : 'payload' in record ? record.payload : record;
        return {type: 'CUSTOM', name, value} as NormalizedStreamEvent;
      }

      // Payload has a `type` but didn't match AG-UI schemas — return as-is
      // for backward compatibility (e.g. Coveo-specific event types not yet
      // in AG-UI, or slightly different shapes from the wire).
      return record as NormalizedStreamEvent;
    }
  }

  // Named SSE event without embedded `type` (e.g. event: turn_started)
  const eventName = raw.event || 'message';
  if (eventName !== 'message') {
    return normalizeNamedEvent(eventName, parsedPayload);
  }

  return {
    type: 'UNKNOWN',
    event: eventName,
    payload: parsedPayload,
  };
}
