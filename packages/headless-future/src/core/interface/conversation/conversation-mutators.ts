import {
  startTurn as _startTurn,
  appendAgentChunk as _appendAgentChunk,
  completeTurn as _completeTurn,
  failTurn as _failTurn,
  abortTurn as _abortTurn,
  setSession as _setSession,
  patchSession as _patchSession,
  setError as _setError,
  setStreamingConnected as _setStreamingConnected,
} from '@/src/core/internal/conversation/conversation-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from './conversation-types.js';

export const startTurn = (payload: StartTurnPayload): StateMutation => {
  return _startTurn(payload);
};

export const appendAgentChunk = (
  payload: AppendAgentChunkPayload
): StateMutation => {
  return _appendAgentChunk(payload);
};

export const completeTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return _completeTurn(payload);
};

export const failTurn = (payload: FailTurnPayload): StateMutation => {
  return _failTurn(payload);
};

export const abortTurn = (payload: FinalizeTurnPayload): StateMutation => {
  return _abortTurn(payload);
};

export const setSession = (session: ConversationSession): StateMutation => {
  return _setSession(session);
};

export const patchSession = (
  sessionPatch: ConversationSession
): StateMutation => {
  return _patchSession(sessionPatch);
};

export const setError = (error: string | null): StateMutation => {
  return _setError(error);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return _setStreamingConnected(isConnected);
};
