/**
 * Streaming Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {StreamError} from './types.js';

export const setConnected = (isConnected: boolean): StateMutation =>
  streamingSlice.actions.setConnected(isConnected);

export const setBuffering = (isBuffering: boolean): StateMutation =>
  streamingSlice.actions.setBuffering(isBuffering);

export const addBytes = (count: number): StateMutation =>
  streamingSlice.actions.addBytes(count);

export const recordEvent = (timestamp: number): StateMutation =>
  streamingSlice.actions.recordEvent(timestamp);

export const setStreamError = (error: StreamError | undefined): StateMutation =>
  streamingSlice.actions.setStreamError(error);

export const setAborted = (aborted: boolean): StateMutation =>
  streamingSlice.actions.setAborted(aborted);

export const rehydrateStreamingMarkers = (payload: {
  aborted: boolean;
  lastEventAt?: number;
}): StateMutation => streamingSlice.actions.rehydrateStreamingMarkers(payload);

export const resetStream = (): StateMutation =>
  streamingSlice.actions.resetStream();
