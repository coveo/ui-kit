import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialConversationState} from './conversation-slice.js';
import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from '@/src/core/interface/conversation/conversation-types.js';

export function createConversationSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'conversation',
    initialConversationState
  );

  return {
    getMessages: createMemoizedStateSelector(
      sliceSelector,
      (state): ConversationMessage[] => state.messages
    ),
    getTurns: createMemoizedStateSelector(
      sliceSelector,
      (state): ConversationTurn[] => state.turns
    ),
    getActiveTurnId: createMemoizedStateSelector(
      sliceSelector,
      (state): string | null => state.activeTurnId
    ),
    getSession: createMemoizedStateSelector(
      sliceSelector,
      (state): ConversationSession => state.session
    ),
    getIsLoading: createMemoizedStateSelector(
      sliceSelector,
      (state): boolean => state.isLoading
    ),
    getError: createMemoizedStateSelector(
      sliceSelector,
      (state): string | null => state.error
    ),
    getStreaming: createMemoizedStateSelector(
      sliceSelector,
      (state): ConversationStreaming => state.streaming
    ),
    getActiveTurnUserMessage: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => {
        const currentActiveTurnId = state.activeTurnId;
        if (!currentActiveTurnId) {
          return undefined;
        }

        const activeTurn = state.turns.find(
          (turn) => turn.id === currentActiveTurnId
        );
        if (!activeTurn) {
          return undefined;
        }

        const messageById = state.messages.reduce(
          (map, message) => map.set(message.id, message),
          new Map()
        );

        for (const messageId of activeTurn.messageIds) {
          const message = messageById.get(messageId);
          if (message?.role === 'user') {
            return message.content;
          }
        }

        return undefined;
      }
    ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createConversationSelectors>
>();
export function getOrCreateConversationSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createConversationSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
