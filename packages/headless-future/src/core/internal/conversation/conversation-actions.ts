import {createAction} from '@reduxjs/toolkit';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from '@/src/core/interface/conversation/conversation-types.js';

export function createConversationActions(interfaceId: string) {
  const prefix = `${interfaceId}/conversation`;
  return {
    startTurn: createAction<StartTurnPayload>(`${prefix}/startTurn`),
    appendAgentChunk: createAction<AppendAgentChunkPayload>(
      `${prefix}/appendAgentChunk`
    ),
    completeTurn: createAction<FinalizeTurnPayload>(`${prefix}/completeTurn`),
    failTurn: createAction<FailTurnPayload>(`${prefix}/failTurn`),
    abortTurn: createAction<FinalizeTurnPayload>(`${prefix}/abortTurn`),
    setSession: createAction<ConversationSession>(`${prefix}/setSession`),
    patchSession: createAction<ConversationSession>(`${prefix}/patchSession`),
    setError: createAction<string | null>(`${prefix}/setError`),
    setStreamingConnected: createAction<boolean>(
      `${prefix}/setStreamingConnected`
    ),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createConversationActions>
>();
export function getOrCreateConversationActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createConversationActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
