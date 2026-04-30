/**
 * Orchestration Feature Slice (Redux Implementation)
 *
 * INTERNAL to Layer 0. NEVER export from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  OrchestrationState,
  OrchestrationSnapshot,
} from '@/src/core/interface/orchestration/types.js';

export const initialOrchestrationState: OrchestrationState = {
  currentMode: 'search-first',
  currentPhase: undefined,
  transitionReason: undefined,
  confidence: undefined,
  lastSnapshotAt: 0,
  isUnavailable: false,
};

export const orchestrationSlice = createSlice({
  name: 'orchestration',
  initialState: initialOrchestrationState,
  reducers: {
    /**
     * Apply a backend-issued (or local-heuristic) orchestration snapshot.
     * Snapshot is authoritative for mode/phase; advisory for metadata hints.
     */
    applySnapshot: (state, action: PayloadAction<OrchestrationSnapshot>) => {
      const snap = action.payload;
      state.currentMode = snap.mode;
      state.currentPhase = snap.phase;
      state.transitionReason = snap.reason;
      state.confidence = snap.confidence;
      state.lastSnapshotAt = snap.timestamp;
      state.isUnavailable = false;
    },
    setUnavailable: (state, action: PayloadAction<boolean>) => {
      state.isUnavailable = action.payload;
      if (action.payload) {
        // Fall back to default mode when endpoint is unreachable
        state.currentMode = 'search-first';
        state.currentPhase = undefined;
        state.transitionReason = 'orchestration-endpoint-unavailable';
      }
    },
  },
  selectors: {
    currentMode: (state) => state.currentMode,
    currentPhase: (state) => state.currentPhase,
    transitionReason: (state) => state.transitionReason,
    confidence: (state) => state.confidence,
    lastSnapshotAt: (state) => state.lastSnapshotAt,
    isUnavailable: (state) => state.isUnavailable,
  },
});
