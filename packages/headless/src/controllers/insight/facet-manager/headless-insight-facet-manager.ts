import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreFacetManager,
  CoreFacetManager,
  FacetManagerState,
  FacetManagerPayload,
} from '../../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerState, FacetManagerPayload};

/**
 * The `InsightFacetManager` controller helps reorder facets to match the most recent search response.
 */
export interface InsightFacetManager extends CoreFacetManager {
  /**
   * The state of the `InsightFacetManager` controller.
   */
  state: FacetManagerState;
}

/**
 * Creates an `InsightFacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildInsightFacetManager(
  engine: InsightEngine
): InsightFacetManager {
  return buildCoreFacetManager(engine);
}
