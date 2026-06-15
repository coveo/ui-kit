import {getOrCreateConversationActions} from '@/src/core/internal/conversation/conversation-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from './conversation-types.js';

export const startTurn = (
  payload: StartTurnPayload,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).startTurn(payload);
};

export const appendAgentChunk = (
  payload: AppendAgentChunkPayload,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).appendAgentChunk(payload);
};

export const completeTurn = (
  payload: FinalizeTurnPayload,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).completeTurn(payload);
};

export const failTurn = (
  payload: FailTurnPayload,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).failTurn(payload);
};

export const abortTurn = (
  payload: FinalizeTurnPayload,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).abortTurn(payload);
};

export const setSession = (
  session: ConversationSession,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).setSession(session);
};

export const patchSession = (
  sessionPatch: ConversationSession,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).patchSession(sessionPatch);
};

export const setError = (
  error: string | null,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).setError(error);
};

export const setStreamingConnected = (
  isConnected: boolean,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationActions(interfaceId).setStreamingConnected(
    isConnected
  );
};
