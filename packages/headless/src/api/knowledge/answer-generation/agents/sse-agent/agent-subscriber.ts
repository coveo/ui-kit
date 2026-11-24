import {
  type BaseEvent,
  type CustomEvent,
  EventType,
  type RunAgentInput,
  type RunErrorEvent,
  type RunFinishedEvent,
  type RunStartedEvent,
  type StepFinishedEvent,
  type StepStartedEvent,
  type TextMessageContentEvent,
  type ToolCallArgsEvent,
  type ToolCallEndEvent,
  type ToolCallStartEvent,
} from '@ag-ui/core';
import type {HttpAgent} from './http-agent.js';

export interface AgentSubscriberParams<TEvent extends BaseEvent> {
  event: TEvent;
  agent: HttpAgent;
  input: RunAgentInput;
}

type AgentEventHandler<TEvent extends BaseEvent> = (params: AgentSubscriberParams<TEvent>) => void;

/**
 * The AG-UI event callbacks the answer generation strategies listen to.
 * Mirrors the matching subset of `AgentSubscriber` from `@ag-ui/client`.
 */
export interface AgentSubscriber {
  onRunStartedEvent?: AgentEventHandler<RunStartedEvent>;
  onRunFinishedEvent?: AgentEventHandler<RunFinishedEvent>;
  onRunErrorEvent?: AgentEventHandler<RunErrorEvent>;
  onStepStartedEvent?: AgentEventHandler<StepStartedEvent>;
  onStepFinishedEvent?: AgentEventHandler<StepFinishedEvent>;
  onTextMessageContentEvent?: AgentEventHandler<TextMessageContentEvent>;
  onToolCallStartEvent?: AgentEventHandler<ToolCallStartEvent>;
  onToolCallArgsEvent?: AgentEventHandler<ToolCallArgsEvent>;
  onToolCallEndEvent?: AgentEventHandler<ToolCallEndEvent>;
  onCustomEvent?: AgentEventHandler<CustomEvent>;
}

const handlerByEventType: Partial<Record<string, keyof AgentSubscriber>> = {
  [EventType.RUN_STARTED]: 'onRunStartedEvent',
  [EventType.RUN_FINISHED]: 'onRunFinishedEvent',
  [EventType.RUN_ERROR]: 'onRunErrorEvent',
  [EventType.STEP_STARTED]: 'onStepStartedEvent',
  [EventType.STEP_FINISHED]: 'onStepFinishedEvent',
  [EventType.TEXT_MESSAGE_CONTENT]: 'onTextMessageContentEvent',
  [EventType.TOOL_CALL_START]: 'onToolCallStartEvent',
  [EventType.TOOL_CALL_ARGS]: 'onToolCallArgsEvent',
  [EventType.TOOL_CALL_END]: 'onToolCallEndEvent',
  [EventType.CUSTOM]: 'onCustomEvent',
};

/**
 * Calls the subscriber callback matching the event type. Events without a callback are ignored.
 * Like `@ag-ui/client`, an error thrown by a callback is logged and doesn't stop the run.
 */
export function notifySubscriber(
  subscriber: AgentSubscriber,
  params: AgentSubscriberParams<BaseEvent>
) {
  const handlerName = handlerByEventType[params.event.type];
  const handler = handlerName && (subscriber[handlerName] as AgentEventHandler<BaseEvent>);
  if (!handler) {
    return;
  }
  try {
    handler(params);
  } catch (error) {
    console.error('Subscriber error:', error);
  }
}
