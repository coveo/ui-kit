import {conversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConversationEndpointStatus} from './conversation-endpoint-types.js';

export const setStatus = (
  status: ConversationEndpointStatus
): StateMutation => {
  return conversationEndpointSlice.actions.setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return conversationEndpointSlice.actions.setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return conversationEndpointSlice.actions.setConfiguration(configuration);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return conversationEndpointSlice.actions.setStreamingConnected(isConnected);
};
