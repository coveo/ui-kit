import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import type {ConversationState} from './conversation-types.js';

type StateWithConversationSlice = {conversation: ConversationState};

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

export const streaming = (state: StateWithConversationSlice) =>
  conversationSlice.selectors.streaming(state);
