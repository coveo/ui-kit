import {SearchEngine} from '../../app/search-engine/search-engine';
import {setDesiredCount} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {loadAutomaticFacetSetActions} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions-loader';
import {AutomaticFacetResponse} from '../../features/facets/automatic-facet-set/interfaces/response';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreFacetManager,
  FacetManager as CoreFacetManager,
  FacetManagerState as CoreFacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';

export type {CoreFacetManagerState, FacetManagerPayload, CoreFacetManager};

export interface FacetManagerState extends CoreFacetManagerState {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The list of automatic facet responses.
   */
  automaticFacets?: AutomaticFacetResponse[];
}

export interface FacetManager extends CoreFacetManager {
  /**
   * The state of the `FacetManager` controller.
   */
  state: FacetManagerState;
}

export interface FacetManagerProps {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired count of automatic facets.
   * Must be a positive integer.
   */
  desiredCount: number;
}
/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 * @param props - The optional facet manager props for the automatic facets feature. Automatic facets are currently in beta testing and should be available soon.
 * @returns A `FacetManager` controller instance.
 */
export function buildFacetManager(
  engine: SearchEngine,
  props?: FacetManagerProps
): FacetManager {
  if (!props?.desiredCount) {
    return buildCoreFacetManager(engine);
  }
  if (!loadAutomaticFacetSetActions(engine)) {
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
      const automaticFacets = getAutomaticFacets();
      return {
        ...core.state,
        automaticFacets,
      };
    },
  };
}
