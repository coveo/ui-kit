import {SearchEngine} from '../../app/search-engine/search-engine';
import {setDesiredCount} from '../../features/facets/automatic-facets/automatic-facets-actions';
import {loadAutomaticFacetsActions} from '../../features/facets/automatic-facets/automatic-facets-actions-loader';
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
  automaticFacets: FacetResponse[] | undefined;
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
   * The default value is 0.
   */
  desiredCount?: number;
}

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
  if (props && !loadAutomaticFacetsActions(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  const core = buildCoreFacetManager(engine);
  const getState = () => engine.state;

  if (props && props.desiredCount) {
    dispatch(setDesiredCount(props.desiredCount));
  }

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
