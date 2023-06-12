import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreFacetManager,
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
  FacetManagerProps,
} from '../core/facet-manager/headless-core-facet-manager';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
  FacetManagerProps,
};

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 * @param props - The facet manager props
 * @returns A `FacetManager` controller instance.
 */
export function buildFacetManager(
  engine: SearchEngine,
  props?: FacetManagerProps
): FacetManager {
  return buildCoreFacetManager(engine, props);
}
