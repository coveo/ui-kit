/**
 * Orchestration Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {orchestrationSlice} from '@/src/core/internal/orchestration/orchestration-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {OrchestrationSnapshot} from './orchestration-types.js';

export const applySnapshot = (snapshot: OrchestrationSnapshot): StateMutation =>
  orchestrationSlice.actions.applySnapshot(snapshot);

export const setUnavailable = (isUnavailable: boolean): StateMutation =>
  orchestrationSlice.actions.setUnavailable(isUnavailable);
