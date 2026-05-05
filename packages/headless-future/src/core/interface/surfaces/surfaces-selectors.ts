/**
 * Surfaces Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {surfacesSlice} from '@/src/core/internal/surfaces/surfaces-slice.js';
import type {SurfacesState} from './surfaces-types.js';

export type StateWithSurfacesSlice = {surfaces: SurfacesState};

export const surfaces = (state: StateWithSurfacesSlice) =>
  surfacesSlice.selectors.surfaces(state);
