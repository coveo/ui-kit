import * as conversationActions from '@/src/core/internal/conversation/conversation-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from './conversation-types.js';

export const startTurn = (payload: StartTurnPayload): StateMutation => {
  return conversationActions.startTurn(payload);
};

export const appendAgentChunk = (
  payload: AppendAgentChunkPayload
): StateMutation => {
  return conversationActions.appendAgentChunk(payload);
};

export const completeTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return conversationActions.completeTurn(payload);
};

export const failTurn = (payload: FailTurnPayload): StateMutation => {
  return conversationActions.failTurn(payload);
};

export const abortTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return conversationActions.abortTurn(payload);
};

export const setSession = (session: ConversationSession): StateMutation => {
  return conversationActions.setSession(session);
};

export const patchSession = (
  sessionPatch: ConversationSession
): StateMutation => {
  return conversationActions.patchSession(sessionPatch);
};

export const setError = (error: string | null): StateMutation => {
  return conversationActions.setError(error);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return conversationActions.setStreamingConnected(isConnected);
};
