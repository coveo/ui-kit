import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from './conversation-types.js';
import {initialConversationState} from '@/src/core/internal/conversation/conversation-slice.js';

const getConversationState = (state: State) =>
  state.conversation ?? initialConversationState;

export const messages = createMemoizedStateSelector(
  getConversationState,
  (conversation): ConversationMessage[] => conversation.messages
);

export const turns = createMemoizedStateSelector(
  getConversationState,
  (conversation): ConversationTurn[] => conversation.turns
);

export const activeTurnId = createMemoizedStateSelector(
  getConversationState,
  (conversation): string | null => conversation.activeTurnId
);

export const session = createMemoizedStateSelector(
  getConversationState,
  (conversation): ConversationSession => conversation.session
);

export const isLoading = createMemoizedStateSelector(
  getConversationState,
  (conversation): boolean => conversation.isLoading
);

export const error = createMemoizedStateSelector(
  getConversationState,
  (conversation): string | null => conversation.error
);

export const streaming = createMemoizedStateSelector(
  getConversationState,
  (conversation): ConversationStreaming => conversation.streaming
);

export const activeTurnUserMessage = createMemoizedStateSelector(
  getConversationState,
  (conversation): string | undefined => {
    const currentActiveTurnId = conversation.activeTurnId;
    if (!currentActiveTurnId) {
      return undefined;
    }

    const activeTurn = conversation.turns.find(
      (turn) => turn.id === currentActiveTurnId
    );
    if (!activeTurn) {
      return undefined;
    }

    const messageById = new Map(
      conversation.messages.map((message) => [message.id, message])
    );

    for (const messageId of activeTurn.messageIds) {
      const message = messageById.get(messageId);
      if (message?.role === 'user') {
        return message.content;
      }
    }

    return undefined;
  }
);
