import {getOrCreateConversationEndpointActions} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConversationEndpointStatus} from './conversation-endpoint-types.js';

export const setStatus = (
  status: ConversationEndpointStatus,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationEndpointActions(interfaceId).setStatus(status);
};

export const setError = (
  error: string | null,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationEndpointActions(interfaceId).setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationEndpointActions(interfaceId).setConfiguration(
    configuration
  );
};

export const setStreamingConnected = (
  isConnected: boolean,
  interfaceId: string = 'default'
): StateMutation => {
  return getOrCreateConversationEndpointActions(
    interfaceId
  ).setStreamingConnected(isConnected);
};
