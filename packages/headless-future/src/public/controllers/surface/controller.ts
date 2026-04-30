/**
 * Layer 2: SurfaceController
 *
 * Owns normalized structured surface lifecycle:
 *  - create, patch, replace, clear, serialize, rehydrate
 *  - referential stability and IDs for cross-framework rendering consistency
 *  - surface snapshots scoped per turn and per conversation
 *
 * Non-responsibilities: rendering components/widgets, visual styling,
 * orchestration decisions.
 */

import {Engine} from '@/src/core/interface/engine/engine.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import * as surfacesSelectors from '@/src/core/interface/surfaces/selectors.js';
import * as surfacesMutators from '@/src/core/interface/surfaces/mutate.js';
import type {StructuredSurface} from '@/src/core/interface/surfaces/types.js';

export const buildSurfaceController = (engine: Engine) => {
  engine.adoptSlice(surfacesSlice);

  return {
    get surfaces(): Map<string, StructuredSurface> {
      const record = engine.read(surfacesSelectors.surfaces);
      return new Map(Object.entries(record));
    },

    /**
     * Apply a partial surface update. Creates the surface if it does not exist.
     */
    applySnapshot(event: {
      surfaceId: string;
      updates: Partial<StructuredSurface>;
    }): void {
      engine.mutate(
        surfacesMutators.applySurfaceUpdate(event.surfaceId, event.updates)
      );
    },

    /**
     * Remove a surface by ID.
     */
    clearSurface(surfaceId: string): void {
      engine.mutate(surfacesMutators.clearSurface(surfaceId));
    },

    /**
     * Serialize all surfaces to a plain JSON-compatible record.
     * Suitable for persistence and cross-process transfer.
     */
    serialize(): Record<string, StructuredSurface> {
      return engine.read(surfacesSelectors.surfaces);
    },

    /**
     * Rehydrate surfaces from a serialized record (e.g., from persistence).
     * Replaces the current surface map entirely.
     */
    rehydrate(payload: Record<string, StructuredSurface>): void {
      engine.mutate(surfacesMutators.rehydrateSurfaces(payload));
    },

    subscribe(callback: () => void) {
      return engine.subscribe(surfacesSelectors.surfaces, callback);
    },
  };
};

export type SurfaceController = ReturnType<typeof buildSurfaceController>;
