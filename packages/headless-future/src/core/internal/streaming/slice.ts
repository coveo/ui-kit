/**
 * Streaming Feature Slice (Redux Implementation)
 *
 * INTERNAL to Layer 0. NEVER export from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  StreamingState,
  StreamError,
} from '@/src/core/interface/streaming/types.js';

export const initialStreamingState: StreamingState = {
  isConnected: false,
  isBuffering: false,
  bytesReceived: 0,
  eventsReceived: 0,
  lastEventAt: undefined,
  error: undefined,
  aborted: false,
};

export const streamingSlice = createSlice({
  name: 'streaming',
  initialState: initialStreamingState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.error = undefined;
        state.aborted = false;
      }
    },
    setBuffering: (state, action: PayloadAction<boolean>) => {
      state.isBuffering = action.payload;
    },
    addBytes: (state, action: PayloadAction<number>) => {
      state.bytesReceived += action.payload;
    },
    recordEvent: (state, action: PayloadAction<number>) => {
      state.eventsReceived += 1;
      state.lastEventAt = action.payload;
    },
    setStreamError: (state, action: PayloadAction<StreamError | undefined>) => {
      state.error = action.payload;
      state.isConnected = false;
    },
    setAborted: (state, action: PayloadAction<boolean>) => {
      state.aborted = action.payload;
      if (action.payload) {
        state.isConnected = false;
      }
    },
    resetStream: (state) => {
      state.isConnected = false;
      state.isBuffering = false;
      state.bytesReceived = 0;
      state.eventsReceived = 0;
      state.lastEventAt = undefined;
      state.error = undefined;
      state.aborted = false;
    },
  },
  selectors: {
    isConnected: (state) => state.isConnected,
    isBuffering: (state) => state.isBuffering,
    bytesReceived: (state) => state.bytesReceived,
    eventsReceived: (state) => state.eventsReceived,
    lastEventAt: (state) => state.lastEventAt,
    error: (state) => state.error,
    aborted: (state) => state.aborted,
  },
});
