import {SearchEngine} from '../../app/search-engine/search-engine';
import {FacetResponse} from '../../features/facets/facet-set/interfaces/response';
import {
  buildCoreFacetManager,
  FacetManager as CoreFacetManager,
  FacetManagerState as CoreFacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerPayload};
export type FacetManagerState = CoreFacetManagerState & {
  automaticFacets: FacetResponse[];
};

export type FacetManager = CoreFacetManager & {
  state: CoreFacetManagerState;
};
/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(engine: SearchEngine): FacetManager {
  const core = buildCoreFacetManager(engine);
  const getState = () => engine.state;

  return {
    ...core,
    get state() {
      return {
        ...core.state,
        automaticFacets:
          getState().search.response.generateAutomaticFacets?.facets,
      };
    },
  };
}
