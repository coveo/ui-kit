/**
 * Surfaces Feature Slice (Redux Implementation)
 *
 * INTERNAL to Layer 0. NEVER export from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  SurfacesState,
  StructuredSurface,
} from '@/src/core/interface/surfaces/types.js';

export const initialSurfacesState: SurfacesState = {
  surfaces: {},
};

export const surfacesSlice = createSlice({
  name: 'surfaces',
  initialState: initialSurfacesState,
  reducers: {
    applySurfaceUpdate: (
      state,
      action: PayloadAction<{
        surfaceId: string;
        updates: Partial<StructuredSurface>;
      }>
    ) => {
      const {surfaceId, updates} = action.payload;
      const existing = state.surfaces[surfaceId];
      const now = Date.now();
      if (existing) {
        state.surfaces[surfaceId] = {
          ...existing,
          ...updates,
          id: surfaceId,
          updatedAt: now,
        };
      } else {
        // Create on first update
        state.surfaces[surfaceId] = {
          id: surfaceId,
          type: updates.type ?? 'unknown',
          rootComponent: updates.rootComponent ?? {type: '', props: {}},
          dataModel: updates.dataModel ?? {},
          createdAt: now,
          updatedAt: now,
          ...updates,
        };
      }
    },
    clearSurface: (state, action: PayloadAction<string>) => {
      delete state.surfaces[action.payload];
    },
    rehydrateSurfaces: (
      state,
      action: PayloadAction<Record<string, StructuredSurface>>
    ) => {
      state.surfaces = action.payload;
    },
    clearAllSurfaces: (state) => {
      state.surfaces = {};
    },
  },
  selectors: {
    surfaces: (state) => state.surfaces,
  },
});
