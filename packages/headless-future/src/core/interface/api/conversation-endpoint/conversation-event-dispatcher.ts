import type {NormalizedStreamEvent} from '@/src/api/internal/protocol/stream-types.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';
import {
  getFailedTurnMutations,
  getSuccessfulTurnMutations,
} from './conversation-turn-lifecycle.js';

export interface DispatchConversationEventOptions {
  event: NormalizedStreamEvent;
  turnId: string;
  finalizedAt: number;
}

export interface DispatchConversationEventResult {
  mutations: StateMutation[];
  isTerminalEvent: boolean;
  isMeaningfulEvent: boolean;
}

export function dispatchConversationEvent({
  event,
  turnId,
  finalizedAt,
}: DispatchConversationEventOptions): DispatchConversationEventResult {
  switch (event.type) {
    case 'turn_complete':
      return {
        mutations: getSuccessfulTurnMutations({turnId, finalizedAt}),
        isTerminalEvent: true,
        isMeaningfulEvent: true,
      };

    case 'RUN_ERROR': {
      return {
        mutations: getFailedTurnMutations({
          turnId,
          finalizedAt,
          reason: 'protocol_error',
          error: event.message,
        }),
        isTerminalEvent: true,
        isMeaningfulEvent: true,
      };
    }

    case 'TEXT_MESSAGE_CONTENT': {
      const mutations: StateMutation[] = [];
      if (event.delta) {
        mutations.push(
          conversationMutators.appendAgentChunk({
            turnId,
            chunk: event.delta,
          })
        );
      }

      return {
        mutations,
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
    }

    case 'turn_started': {
      const session = {
        ...(event.conversationSessionId !== undefined
          ? {conversationSessionId: event.conversationSessionId}
          : {}),
        ...(event.conversationToken !== undefined
          ? {conversationToken: event.conversationToken}
          : {}),
      };

      const hasSessionUpdate = Object.keys(session).length > 0;

      return {
        mutations: hasSessionUpdate
          ? [conversationMutators.setSession(session)]
          : [],
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
    }

    case 'UNKNOWN':
      return {
        mutations: [
          conversationEndpointMutators.setError(
            `Conversation stream warning: unsupported event "${event.event}".`
          ),
        ],
        isTerminalEvent: false,
        isMeaningfulEvent: false,
      };

    case 'CUSTOM':
      return {
        mutations: [
          conversationEndpointMutators.setError(
            `Conversation stream warning: custom event "${event.name}" was ignored.`
          ),
        ],
        isTerminalEvent: false,
        isMeaningfulEvent: false,
      };

    default:
      return {
        mutations: [],
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
  }
}
