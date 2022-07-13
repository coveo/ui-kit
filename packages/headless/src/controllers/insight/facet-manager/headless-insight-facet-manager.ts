import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreFacetManager,
  FacetManagerState,
  FacetManagerPayload,
  FacetManager,
} from '../../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerState, FacetManagerPayload, FacetManager};

/**
 * Creates an insight `FacetManager` instance.
 *
 * @param engine - The insight engine.
 */
export function buildFacetManager(engine: InsightEngine): FacetManager {
  return buildCoreFacetManager(engine);
}
