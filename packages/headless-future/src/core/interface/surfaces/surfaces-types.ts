/**
 * Surfaces Feature Types
 *
 * Normalized structured surface lifecycle: create, patch, serialize, rehydrate.
 * Surfaces are render-agnostic and fully serializable.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export type StructuredSurface = {
  id: string;
  type: string;
  rootComponent: {type: string; props: Record<string, unknown>};
  dataModel: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
};

export interface SurfacesState {
  /** Surfaces keyed by surfaceId */
  surfaces: Record<string, StructuredSurface>;
}
