import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreFacetManager,
  FacetManagerState,
  FacetManagerPayload,
  FacetManager,
} from '../../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates an `InsightFacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(
  engine: InsightEngine
): FacetManager {
  return buildCoreFacetManager(engine);
}
