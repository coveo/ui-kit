/**
 * Layer 2: StreamingController
 *
 * Exposes the streaming domain state for diagnostic and UI purposes.
 * Stream mechanics are owned by the ConversationController; this controller
 * provides a read-only view of connection status, counters, and errors.
 */

import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import * as streamingSelectors from '@/src/core/interface/streaming/selectors.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector(
  [
    streamingSelectors.isConnected,
    streamingSelectors.isBuffering,
    streamingSelectors.bytesReceived,
    streamingSelectors.eventsReceived,
    streamingSelectors.lastEventAt,
    streamingSelectors.streamError,
  ],
  (
    isConnected,
    isBuffering,
    bytesReceived,
    eventsReceived,
    lastEventAt,
    error
  ) => ({
    isConnected,
    isBuffering,
    bytesReceived,
    eventsReceived,
    lastEventAt,
    error,
  })
);

export const buildStreamingController = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);

  fullEngine.adoptSlice(streamingSlice);

  return {
    get state() {
      return engine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return engine.subscribe(stateSelect, callback);
    },
  };
};

export type StreamingController = ReturnType<typeof buildStreamingController>;
