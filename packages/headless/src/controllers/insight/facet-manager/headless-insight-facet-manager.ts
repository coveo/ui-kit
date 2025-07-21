import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  buildCoreFacetManager,
  type FacetManager,
  type FacetManagerPayload,
  type FacetManagerState,
} from '../../core/facet-manager/headless-core-facet-manager.js';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates an insight `FacetManager` instance.
 *
 * @param engine - The insight engine.
 * @returns A `FacetManager` controller instance.
 *
 * @group Controllers
 * @category FacetManager
 */
export function buildFacetManager(engine: InsightEngine): FacetManager {
  return buildCoreFacetManager(engine);
}
