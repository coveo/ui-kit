import {CoreEngine} from '../../../app/engine';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice';
import {setDesiredCount} from '../../../features/facets/automatic-facets/automatic-facets-actions';
import {automaticFacetsReducer as automaticFacets} from '../../../features/facets/automatic-facets/automatic-facets-slice';
import {FacetResponse} from '../../../features/facets/facet-set/interfaces/response';
import {searchReducer as search} from '../../../features/search/search-slice';
import {SearchSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {sortFacets} from '../../../utils/facet-utils';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

/**
 * A facet payload object to be sorted by the manager.
 */
export interface FacetManagerPayload<T> {
  /**
   * A unique string identifying a facet.
   */
  facetId: string;

  /**
   * The payload to associate with the facetId. This can be anything e.g., a DOM element, JSX, a string.
   */
  payload: T;
}

/**
 * The `FacetManager` controller helps reorder facets to match the most recent search response.
 */
export interface FacetManager extends Controller {
  /**
   * Sorts the facets to match the order in the most recent search response.
   *
   * @param facets - An array of facet payloads to sort.
   * @returns A sorted array.
   */
  sort<T>(facets: FacetManagerPayload<T>[]): FacetManagerPayload<T>[];

  /**
   * The state of the `CoreFacetManager` controller.
   */
  state: FacetManagerState;
}
/**
 * A facet payload object to be sorted by the manager.
 */
export interface FacetManagerState {
  /**
   * The facet ids sorted in the same order as the latest response.
   */
  facetIds: string[];
  /**
   * The list of automatic facet responses.
   */
  automaticFacets?: FacetResponse[];
}

/**
 * A facet payload object to be sorted by the manager.
 */
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
 * @param props - The facetManager configuration
 * @returns The `FacetManager` controller instance.
 */
export function buildCoreFacetManager(
  engine: CoreEngine,
  props?: FacetManagerProps
): FacetManager {
  if (!loadFacetManagerReducers(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  if (props && props.desiredCount) {
    dispatch(setDesiredCount(props.desiredCount));
  }
  return {
    ...controller,

    sort<T>(facets: FacetManagerPayload<T>[]) {
      return sortFacets(facets, this.state.facetIds);
    },

    get state() {
      const facets = getState().search.response.facets;
      const facetIds = facets.map((f) => f.facetId);
      const automaticFacets =
        getState().search.response.generateAutomaticFacets?.facets;

      return {facetIds, automaticFacets};
    },
  };
}

function loadFacetManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchSection> {
  engine.addReducers({search, facetOptions});
  engine.addReducers({automaticFacets});
  return true;
}
