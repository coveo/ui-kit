/**
 * Surfaces Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {StructuredSurface} from './types.js';

export const applySurfaceUpdate = (
  surfaceId: string,
  updates: Partial<StructuredSurface>
): StateMutation =>
  surfacesSlice.actions.applySurfaceUpdate({surfaceId, updates});

export const clearSurface = (surfaceId: string): StateMutation =>
  surfacesSlice.actions.clearSurface(surfaceId);

export const rehydrateSurfaces = (
  payload: Record<string, StructuredSurface>
): StateMutation => surfacesSlice.actions.rehydrateSurfaces(payload);

export const clearAllSurfaces = (): StateMutation =>
  surfacesSlice.actions.clearAllSurfaces();
