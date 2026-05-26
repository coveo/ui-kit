import {
  ConversationEndpointState,
  ConversationEndpointStatus,
} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

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
  reducers: {
    setStatus: (state, action: PayloadAction<ConversationEndpointStatus>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConfiguration: (state, action: PayloadAction<Record<string, any>>) => {
      state.configuration = action.payload;
    },
    setStreamingConnected: (state, action: PayloadAction<boolean>) => {
      state.streaming.isConnected = action.payload;
    },
  },
  selectors: {
    status: (state) => state.status,
    error: (state) => state.error,
    configuration: (state) => state.configuration,
    streaming: (state) => state.streaming,
  },
});
