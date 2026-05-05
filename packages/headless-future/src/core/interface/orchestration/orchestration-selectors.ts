/**
 * Orchestration Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {orchestrationSlice} from '@/src/core/internal/orchestration/slice.js';
import type {OrchestrationState} from './types.js';

export type StateWithOrchestrationSlice = {orchestration: OrchestrationState};

export const currentMode = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.currentMode(state);

export const currentPhase = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.currentPhase(state);

export const transitionReason = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.transitionReason(state);

export const confidence = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.confidence(state);

export const lastSnapshotAt = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.lastSnapshotAt(state);

export const isUnavailable = (state: StateWithOrchestrationSlice) =>
  orchestrationSlice.selectors.isUnavailable(state);
