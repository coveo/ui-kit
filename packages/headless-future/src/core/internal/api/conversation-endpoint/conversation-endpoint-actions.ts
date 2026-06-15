import {createAction} from '@reduxjs/toolkit';
import type {ConversationEndpointStatus} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';

export function createConversationEndpointActions(interfaceId: string) {
  const prefix = `${interfaceId}/conversationEndpoint`;
  return {
    setStatus: createAction<ConversationEndpointStatus>(`${prefix}/setStatus`),
    setError: createAction<string | null>(`${prefix}/setError`),
    setConfiguration: createAction<Record<string, any>>(
      `${prefix}/setConfiguration`
    ),
    setStreamingConnected: createAction<boolean>(
      `${prefix}/setStreamingConnected`
    ),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createConversationEndpointActions>
>();
export function getOrCreateConversationEndpointActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(
      interfaceId,
      createConversationEndpointActions(interfaceId)
    );
  }
  return actionsCache.get(interfaceId)!;
}
