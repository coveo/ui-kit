import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';

export interface DispatchResult {
  turnId: string;
  isTerminal: boolean;
}

export interface EventDispatcherDeps {
  statePort: GenerativeStatePort;
  ensureAgentResponse: (turnId: string) => void;
  onA2uiSurface: (turnId: string, content: Record<string, unknown>) => void;
}

export function dispatchStreamEvent(
  turnId: string,
  event: NormalizedStreamEvent,
  deps: EventDispatcherDeps
): DispatchResult {
  switch (event.type) {
    case 'turn_started': {
      if (event.conversationSessionId || event.conversationToken) {
        deps.statePort.setConversationSession(event.conversationSessionId, event.conversationToken);
      }
      return {turnId, isTerminal: false};
    }

    case 'TEXT_MESSAGE_START': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.startMessage(turnId, event.role ?? 'assistant');
      return {turnId, isTerminal: false};
    }

    case 'TEXT_MESSAGE_CONTENT': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.appendMessageDelta(turnId, event.delta);
      return {turnId, isTerminal: false};
    }

    case 'TEXT_MESSAGE_END': {
      return {turnId, isTerminal: false};
    }

    case 'REASONING_MESSAGE_START': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.startReasoning(turnId);
      return {turnId, isTerminal: false};
    }

    case 'REASONING_MESSAGE_CONTENT': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.appendReasoningDelta(turnId, event.delta);
      return {turnId, isTerminal: false};
    }

    case 'REASONING_MESSAGE_END': {
      deps.statePort.endReasoning(turnId);
      return {turnId, isTerminal: false};
    }

    case 'TOOL_CALL_START': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.startToolCall(turnId, event.toolCallId, event.toolCallName);
      return {turnId, isTerminal: false};
    }

    case 'TOOL_CALL_ARGS': {
      deps.statePort.appendToolCallArgs(turnId, event.toolCallId, event.delta);
      return {turnId, isTerminal: false};
    }

    case 'TOOL_CALL_END': {
      return {turnId, isTerminal: false};
    }

    case 'TOOL_CALL_RESULT': {
      deps.statePort.completeToolCall(turnId, event.toolCallId, event.content);
      return {turnId, isTerminal: false};
    }

    case 'ACTIVITY_SNAPSHOT': {
      deps.ensureAgentResponse(turnId);
      const content = event.content as Record<string, unknown>;
      deps.statePort.appendActivity(turnId, {
        id: event.messageId,
        kind: event.activityType,
        payload: content,
        replace: event.replace,
      });

      if (event.activityType === 'a2ui-surface') {
        deps.onA2uiSurface(turnId, content);
      }

      return {turnId, isTerminal: false};
    }

    case 'STATE_SNAPSHOT': {
      deps.ensureAgentResponse(turnId);
      deps.statePort.setStateSnapshot(turnId, asRecord(event.snapshot));
      return {turnId, isTerminal: false};
    }

    case 'RUN_STARTED':
    case 'RUN_FINISHED':
    case 'CUSTOM': {
      return {turnId, isTerminal: false};
    }

    case 'turn_complete': {
      if (event.conversationSessionId || event.conversationToken) {
        deps.statePort.setConversationSession(event.conversationSessionId, event.conversationToken);
      }
      deps.statePort.completeTurn(turnId);
      return {turnId, isTerminal: true};
    }

    case 'RUN_ERROR': {
      deps.statePort.failTurn(turnId, event.message || 'An error occurred during the turn.');
      return {turnId, isTerminal: true};
    }

    default:
      return handleUnknownEvent(turnId, event, deps);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function handleUnknownEvent(
  turnId: string,
  event: NormalizedStreamEvent,
  deps: EventDispatcherDeps
): DispatchResult {
  const rawEvent = event as unknown as Record<string, unknown>;
  if (rawEvent.type === 'error') {
    if (
      (rawEvent as {conversationSessionId?: string}).conversationSessionId ||
      (rawEvent as {conversationToken?: string}).conversationToken
    ) {
      deps.statePort.setConversationSession(
        (rawEvent as {conversationSessionId?: string}).conversationSessionId,
        (rawEvent as {conversationToken?: string}).conversationToken
      );
    }
    const errorObj = rawEvent.error;
    const message =
      typeof errorObj === 'object' && errorObj !== null && 'message' in errorObj
        ? String((errorObj as {message: unknown}).message)
        : 'A gateway error occurred.';
    deps.statePort.failTurn(turnId, message);
    return {turnId, isTerminal: true};
  }

  return {turnId, isTerminal: false};
}
