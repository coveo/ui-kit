import * as conversationEndpointActions from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConversationEndpointStatus} from './conversation-endpoint-types.js';

export const setStatus = (
  status: ConversationEndpointStatus
): StateMutation => {
  return conversationEndpointActions.setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return conversationEndpointActions.setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return conversationEndpointActions.setConfiguration(configuration);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return conversationEndpointActions.setStreamingConnected(isConnected);
};
