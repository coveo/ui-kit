import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreFacetManager,
  FacetManager,
  FacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager.js';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(engine: SearchEngine): FacetManager {
  return buildCoreFacetManager(engine);
}
