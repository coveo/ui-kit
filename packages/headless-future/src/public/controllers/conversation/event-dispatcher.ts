import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {NormalizedStreamEvent} from '@/src/api/protocol/types.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import type {
  ConversationSession,
  ConversationWarningCode,
} from '@/src/core/interface/conversation/types.js';

export type EventDispatchResult = {
  receivedTerminalEvent: boolean;
  runErrorMessage?: string;
};

const UNKNOWN_STREAM_EVENT_WARNING: ConversationWarningCode =
  'unknown_stream_event';

export const dispatchStreamEvent = (
  fullEngine: FullEngine,
  event: NormalizedStreamEvent,
  turnId: string,
  assistantMessageId: string
): EventDispatchResult => {
  fullEngine.mutate(streamingMutators.recordEvent(Date.now()));

  switch (event.type) {
    case 'turn_started': {
      const updates: Partial<ConversationSession> = {};
      if (event.conversationSessionId) {
        updates.sessionId = event.conversationSessionId;
      }
      if (event.conversationToken) {
        updates.conversationToken = event.conversationToken;
      }
      if (Object.keys(updates).length > 0) {
        fullEngine.mutate(conversationMutators.updateSession(updates));
      }
      return {receivedTerminalEvent: false};
    }
    case 'TEXT_MESSAGE_CONTENT': {
      if (event.messageId === assistantMessageId) {
        fullEngine.mutate(
          conversationMutators.appendMessageContent(
            assistantMessageId,
            event.delta
          )
        );
      }
      return {receivedTerminalEvent: false};
    }
    case 'RUN_FINISHED':
    case 'turn_complete':
      return {receivedTerminalEvent: true};
    case 'RUN_ERROR':
      fullEngine.mutate(
        conversationMutators.setError(event.message ?? 'Stream error')
      );
      fullEngine.mutate(
        conversationMutators.setStructuredError({
          code: event.code ?? 'RUN_ERROR',
          message: event.message ?? 'Stream error',
          source: 'protocol',
          recoverable: false,
          timestamp: Date.now(),
          turnId,
        })
      );
      return {
        receivedTerminalEvent: false,
        runErrorMessage: event.message ?? 'Stream error',
      };
    case 'CUSTOM':
    case 'UNKNOWN':
      fullEngine.mutate(
        conversationMutators.addTurnWarnings(turnId, [
          UNKNOWN_STREAM_EVENT_WARNING,
        ])
      );
      return {receivedTerminalEvent: false};
    default:
      return {receivedTerminalEvent: false};
  }
};
