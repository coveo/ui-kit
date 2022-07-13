import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreFacetManager,
  CoreFacetManager,
  FacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerState, FacetManagerPayload};

/**
 * The `FacetManager` controller helps reorder facets to match the most recent search response.
 */
export interface FacetManager extends CoreFacetManager {
  /**
   * The state of the `FacetManager` controller.
   */
  state: FacetManagerState;
}

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(engine: SearchEngine): FacetManager {
  return buildCoreFacetManager(engine);
}
