/**
 * Streaming Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {streamingSlice} from '@/src/core/internal/streaming/streaming-slice.js';
import type {StreamingState} from './streaming-types.js';

export type StateWithStreamingSlice = {streaming: StreamingState};

export const isConnected = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.isConnected(state);

export const isBuffering = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.isBuffering(state);

export const bytesReceived = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.bytesReceived(state);

export const eventsReceived = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.eventsReceived(state);

export const lastEventAt = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.lastEventAt(state);

export const streamError = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.error(state);

export const aborted = (state: StateWithStreamingSlice) =>
  streamingSlice.selectors.aborted(state);
