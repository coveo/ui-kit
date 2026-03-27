import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreFacetManager,
  type FacetManager,
  type FacetManagerPayload,
  type FacetManagerState,
} from '../core/facet-manager/headless-core-facet-manager.js';

export type {FacetManager, FacetManagerPayload, FacetManagerState};

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 *
 * @group Controllers
 * @category FacetManager
 */
export function buildFacetManager(
  engine: SearchEngine | FrankensteinEngine
): FacetManager {
  return buildCoreFacetManager(ensureSearchEngine(engine));
}
