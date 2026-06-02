import {
  setStatus as _setStatus,
  setError as _setError,
  setConfiguration as _setConfiguration,
  setStreamingConnected as _setStreamingConnected,
} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConversationEndpointStatus} from './conversation-endpoint-types.js';

export const setStatus = (
  status: ConversationEndpointStatus
): StateMutation => {
  return _setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return _setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return _setConfiguration(configuration);
};

export const setStreamingConnected = (isConnected: boolean): StateMutation => {
  return _setStreamingConnected(isConnected);
};
