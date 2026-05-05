/**
 * Conversation Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import type {
  ConversationState,
  ConversationTurn,
} from './conversation-types.js';

export type StateWithConversationSlice = {conversation: ConversationState};

export const messages = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.messages(state);

export const turns = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.turns(state);

export const activeTurnId = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.activeTurnId(state);

export const session = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.session(state);

export const isLoading = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.isLoading(state);

export const error = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.error(state);

export const structuredError = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.structuredError(state);

export const streaming = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streaming(state);

export const streamingConnected = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streamingConnected(state);

export const streamingBytesReceived = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streamingBytesReceived(state);

export const streamingEventsReceived = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streamingEventsReceived(state);

export const streamingLastEventAt = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streamingLastEventAt(state);

export const streamingAborted = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streamingAborted(state);

export const activeTurn = (
  state: StateWithConversationSlice
): ConversationTurn | null => {
  const turnId = conversationSlice.selectors.activeTurnId(state);
  if (!turnId) return null;
  return (
    conversationSlice.selectors.turns(state).find((t) => t.id === turnId) ??
    null
  );
};
