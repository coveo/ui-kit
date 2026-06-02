import type {ConversationEndpointState} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';
import {createSlice} from '@reduxjs/toolkit';
import * as conversationEndpointActions from './conversation-endpoint-actions.js';

export const initialConversationEndpointState: ConversationEndpointState = {
  configuration: {},
  status: 'idle',
  error: null,
  streaming: {
    isConnected: false,
  },
};

export const conversationEndpointSlice = createSlice({
  name: 'conversationEndpoint',
  initialState: initialConversationEndpointState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(conversationEndpointActions.setStatus, (state, action) => {
      state.status = action.payload;
    });
    builder.addCase(conversationEndpointActions.setError, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(
      conversationEndpointActions.setConfiguration,
      (state, action) => {
        state.configuration = action.payload;
      }
    );
    builder.addCase(
      conversationEndpointActions.setStreamingConnected,
      (state, action) => {
        state.streaming.isConnected = action.payload;
      }
    );
  },
  selectors: {
    status: (state) => state.status,
    error: (state) => state.error,
    configuration: (state) => state.configuration,
    streaming: (state) => state.streaming,
  },
});
