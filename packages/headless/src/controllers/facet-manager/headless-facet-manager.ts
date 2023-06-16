import {SearchEngine} from '../../app/search-engine/search-engine';
import {setDesiredCount} from '../../features/facets/automatic-facets/automatic-facets-actions';
import {loadAutomaticFacetsActions} from '../../features/facets/automatic-facets/automatic-facets-actions-loader';
import {getAutomaticFacetId} from '../../features/facets/automatic-facets/automatic-facets-utils';
import {FacetResponse} from '../../features/facets/facet-set/interfaces/response';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreFacetManager,
  FacetManager as CoreFacetManager,
  FacetManagerState as CoreFacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';

export type {FacetManagerPayload, CoreFacetManager, CoreFacetManagerState};

export interface FacetManagerState extends CoreFacetManagerState {
  /**
   * The list of automatic facet responses.
   */
  automaticFacets?: FacetResponse[] | undefined;
}

export interface FacetManager extends CoreFacetManager {
  /**
   * The state of the FacetManager.
   */
  state: FacetManagerState;
}

export interface FacetManagerProps {
  /**
   * The desired count of automatic facets.
   * Must be a positive integer.
   */
  desiredCount: number;
}

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 * @param props - The facet manager props.
 * @returns A `FacetManager` controller instance.
 */
export function buildFacetManager(
  engine: SearchEngine,
  props?: FacetManagerProps
): FacetManager {
  if (!props?.desiredCount) {
    return buildCoreFacetManager(engine);
  }

  if (!loadAutomaticFacetsActions(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  dispatch(setDesiredCount(props.desiredCount));

  const core = buildCoreFacetManager(engine);
  const getAutomaticFacets = () =>
    engine.state.search.response.generateAutomaticFacets?.facets;

  return {
    ...core,
    get state() {
      const automaticFacets = getAutomaticFacets()?.map((facet) => ({
        ...facet,
        facetId: getAutomaticFacetId(facet.field),
      }));

      return {
        ...core.state,
        automaticFacets,
      };
    },
  };
}
