/**
 * Minimal event types for SSE-based agent communication.
 *
 * These types represent the subset of the AG-UI protocol events
 * that are actually used by the answer-generation agents.
 */

/**
 * Event type identifiers used in the SSE stream.
 */
export enum EventType {
  RUN_STARTED = 'RUN_STARTED',
  RUN_FINISHED = 'RUN_FINISHED',
  RUN_ERROR = 'RUN_ERROR',
  TEXT_MESSAGE_START = 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT = 'TEXT_MESSAGE_CONTENT',
  CUSTOM = 'CUSTOM',
}

export interface BaseEvent {
  type: string;
  timestamp?: number;
}

export interface RunStartedEvent extends BaseEvent {
  type: EventType.RUN_STARTED;
  runId: string;
  threadId: string;
}

export interface RunFinishedEvent extends BaseEvent {
  type: EventType.RUN_FINISHED;
  runId: string;
  threadId: string;
  // biome-ignore lint/suspicious/noExplicitAny: RunFinishedEvent.result is an open-ended server payload.
  result?: any;
}

export interface RunErrorEvent extends BaseEvent {
  type: EventType.RUN_ERROR;
  message: string;
  code?: string;
}

export interface TextMessageStartEvent extends BaseEvent {
  type: EventType.TEXT_MESSAGE_START;
  messageId: string;
}

export interface TextMessageContentEvent extends BaseEvent {
  type: EventType.TEXT_MESSAGE_CONTENT;
  messageId: string;
  delta: string;
}

export interface CustomEvent extends BaseEvent {
  type: EventType.CUSTOM;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: CustomEvent.value is an open-ended server payload.
  value: any;
}
