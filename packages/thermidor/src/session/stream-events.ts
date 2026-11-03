/**
 * Reads the events of a converse stream, for the session's single request and the concurrent lane
 * alike.
 */

import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent, RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import {SURFACE_ACTIVITY_KIND} from './fold.js';

export interface ReadStreamEventsOptions {
  stream: ReadableStream<Uint8Array>;
  signal?: AbortSignal;
  onEvent: (event: NormalizedStreamEvent) => void;
  onDone?: () => void;
  onError?: (error: unknown) => void;
}

/** Reads `stream` and hands each event to `onEvent`, parsed. */
export function readStreamEvents({
  stream,
  signal,
  onEvent,
  onDone,
  onError,
}: ReadStreamEventsOptions): Promise<void> {
  return readEventStream({
    stream,
    signal,
    onEvent: (rawEvent: RawSSEEvent) => onEvent(parseSSEEvent(rawEvent)),
    onDone,
    onError,
  });
}

/** What an event of an action's stream means to the action. */
export type ActionStreamEvent =
  | {kind: 'runError'; message: string}
  | {kind: 'terminal'}
  | {kind: 'snapshot'}
  | {kind: 'other'};

const TERMINAL: ActionStreamEvent = {kind: 'terminal'};
const SNAPSHOT: ActionStreamEvent = {kind: 'snapshot'};
const OTHER: ActionStreamEvent = {kind: 'other'};

export function actionStreamEvent(event: NormalizedStreamEvent): ActionStreamEvent {
  if (event.type === 'RUN_ERROR') {
    return {
      kind: 'runError',
      message: (event as {message?: string}).message || 'An error occurred during the action.',
    };
  }
  if (event.type === 'RUN_FINISHED' || event.type === 'turn_complete') {
    return TERMINAL;
  }
  if (event.type === 'ACTIVITY_SNAPSHOT') {
    return SNAPSHOT;
  }
  return OTHER;
}

/** The content and A2-UI messages of a surface snapshot, or `undefined` when `event` is none. */
export function surfaceSnapshot(
  event: NormalizedStreamEvent
): {content: Record<string, unknown>; messages: readonly unknown[]} | undefined {
  const snapshot = event as unknown as {activityType?: string; content?: unknown};
  const content = snapshot.content as Record<string, unknown> | undefined;
  const messages = content?.['messages'];
  return event.type === 'ACTIVITY_SNAPSHOT' &&
    snapshot.activityType === SURFACE_ACTIVITY_KIND &&
    Array.isArray(messages)
    ? {content: content as Record<string, unknown>, messages}
    : undefined;
}
