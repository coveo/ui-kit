/**
 * Conversation Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {conversationSlice} from '@/src/core/internal/conversation/slice.js';
import type {StateMutation} from '@/src/core/interface/types.js';
import type {
  ConversationMessage,
  ConversationTurn,
  ConversationSession,
  ConversationState,
  TurnStatus,
} from './types.js';

export const rehydrateConversation = (
  payload: ConversationState
): StateMutation => conversationSlice.actions.rehydrateConversation(payload);

export const addMessage = (message: ConversationMessage): StateMutation =>
  conversationSlice.actions.addMessage(message);

export const updateMessage = (
  id: string,
  updates: Partial<ConversationMessage>
): StateMutation => conversationSlice.actions.updateMessage({id, updates});

export const appendMessageContent = (
  id: string,
  delta: string
): StateMutation => conversationSlice.actions.appendMessageContent({id, delta});

export const addTurn = (turn: ConversationTurn): StateMutation =>
  conversationSlice.actions.addTurn(turn);

export const updateTurnStatus = (
  id: string,
  status: TurnStatus,
  extras?: {
    finalizedAt?: number;
    reason?: string;
    assistantMessageId?: string;
  }
): StateMutation =>
  conversationSlice.actions.updateTurnStatus({id, status, ...extras});

export const setActiveTurnId = (id: string | null): StateMutation =>
  conversationSlice.actions.setActiveTurnId(id);

export const updateSession = (
  updates: Partial<ConversationSession>
): StateMutation => conversationSlice.actions.updateSession(updates);

export const setLoading = (isLoading: boolean): StateMutation =>
  conversationSlice.actions.setLoading(isLoading);

export const setError = (error: string | null): StateMutation =>
  conversationSlice.actions.setError(error);

export const clearConversation = (): StateMutation =>
  conversationSlice.actions.clearConversation();
