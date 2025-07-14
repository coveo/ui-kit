import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreFacetManager,
  type FacetManager,
  type FacetManagerPayload,
  type FacetManagerState,
} from '../core/facet-manager/headless-core-facet-manager.js';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 *
 * @group Controllers
 * @category FacetManager
 */
export function buildFacetManager(engine: SearchEngine): FacetManager {
  return buildCoreFacetManager(engine);
}
