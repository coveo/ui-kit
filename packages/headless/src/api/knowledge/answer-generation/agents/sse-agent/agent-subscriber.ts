/**
 * Subscriber interface and input types for SSE-based agents.
 */

import type {
  CustomEvent,
  RunErrorEvent,
  RunFinishedEvent,
  RunStartedEvent,
  TextMessageContentEvent,
  TextMessageStartEvent,
} from './event-types.js';

/**
 * The input passed to an agent run. Only `forwardedProps` is used
 * by the answer-generation agents to carry request-specific data.
 */
export interface RunAgentInput {
  // biome-ignore lint/suspicious/noExplicitAny: forwardedProps is an open-ended bag of caller-defined values.
  forwardedProps?: Record<string, any>;
}

/**
 * A subscriber that receives typed SSE events during an agent run.
 * All callbacks are optional; implement only those you need.
 */
export interface AgentSubscriber {
  onRunStartedEvent?(params: {event: RunStartedEvent}): void;
  onTextMessageStartEvent?(params: {event: TextMessageStartEvent}): void;
  onTextMessageContentEvent?(params: {event: TextMessageContentEvent}): void;
  onCustomEvent?(params: {event: CustomEvent}): void;
  onRunErrorEvent?(params: {event: RunErrorEvent}): void;
  // biome-ignore lint/suspicious/noExplicitAny: RunFinishedEvent.result is an open-ended server payload.
  onRunFinishedEvent?(params: {event: RunFinishedEvent; result?: any}): void;
}
