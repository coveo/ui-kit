import type {ConversationEndpointState} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';
import {createSlice} from '@reduxjs/toolkit';
import {getOrCreateConversationEndpointActions} from './conversation-endpoint-actions.js';

export const initialConversationEndpointState: ConversationEndpointState = {
  configuration: {},
  status: 'idle',
  error: null,
  streaming: {
    isConnected: false,
  },
};

export function createConversationEndpointSlice(interfaceId: string) {
  const actions = getOrCreateConversationEndpointActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/conversationEndpoint`,
    initialState: initialConversationEndpointState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setStatus, (state, action) => {
        state.status = action.payload;
      });
      builder.addCase(actions.setError, (state, action) => {
        state.error = action.payload;
      });
      builder.addCase(actions.setConfiguration, (state, action) => {
        state.configuration = action.payload;
      });
      builder.addCase(actions.setStreamingConnected, (state, action) => {
        state.streaming.isConnected = action.payload;
      });
    },
  });
}

const sliceCache = new Map<
  string,
  ReturnType<typeof createConversationEndpointSlice>
>();
export function getOrCreateConversationEndpointSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createConversationEndpointSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
