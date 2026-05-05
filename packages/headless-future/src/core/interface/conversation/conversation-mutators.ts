/**
 * Conversation Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {
  ConversationMessage,
  ConversationTurn,
  ConversationSession,
  ConversationState,
  ConversationWarningCode,
  StructuredConversationError,
  TurnStatus,
} from './conversation-types.js';

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
    warningCodes?: ConversationWarningCode[];
  }
): StateMutation =>
  conversationSlice.actions.updateTurnStatus({id, status, ...extras});

export const addTurnWarnings = (
  id: string,
  warningCodes: ConversationWarningCode[]
): StateMutation =>
  conversationSlice.actions.addTurnWarnings({id, warningCodes});

export const setActiveTurnId = (id: string | null): StateMutation =>
  conversationSlice.actions.setActiveTurnId(id);

export const updateSession = (
  updates: Partial<ConversationSession>
): StateMutation => conversationSlice.actions.updateSession(updates);

export const setLoading = (isLoading: boolean): StateMutation =>
  conversationSlice.actions.setLoading(isLoading);

export const setError = (error: string | null): StateMutation =>
  conversationSlice.actions.setError(error);

export const setStructuredError = (
  error: StructuredConversationError | null
): StateMutation => conversationSlice.actions.setStructuredError(error);

export const setStreamingConnected = (isConnected: boolean): StateMutation =>
  conversationSlice.actions.setStreamingConnected(isConnected);

export const addStreamingBytes = (count: number): StateMutation =>
  conversationSlice.actions.addStreamingBytes(count);

export const recordStreamingEvent = (timestamp: number): StateMutation =>
  conversationSlice.actions.recordStreamingEvent(timestamp);

export const setStreamingAborted = (aborted: boolean): StateMutation =>
  conversationSlice.actions.setStreamingAborted(aborted);

export const resetStreamingForTurn = (): StateMutation =>
  conversationSlice.actions.resetStreamingForTurn();

export const clearConversation = (): StateMutation =>
  conversationSlice.actions.clearConversation();
