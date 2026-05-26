import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from './conversation-types.js';

export const startTurn = (payload: StartTurnPayload): StateMutation => {
  return conversationSlice.actions.startTurn(payload);
};

export const appendAgentChunk = (
  payload: AppendAgentChunkPayload
): StateMutation => {
  return conversationSlice.actions.appendAgentChunk(payload);
};

export const completeTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return conversationSlice.actions.completeTurn(payload);
};

export const failTurn = (payload: FailTurnPayload): StateMutation => {
  return conversationSlice.actions.failTurn(payload);
};

export const abortTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return conversationSlice.actions.abortTurn(payload);
};

export const setSession = (session: ConversationSession): StateMutation => {
  return conversationSlice.actions.setSession(session);
};

export const patchSession = (
  sessionPatch: ConversationSession
): StateMutation => {
  return conversationSlice.actions.patchSession(sessionPatch);
};

export const setError = (error: string | null): StateMutation => {
  return conversationSlice.actions.setError(error);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return conversationSlice.actions.setStreamingConnected(isConnected);
};
