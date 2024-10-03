import {CoreEngine} from '../../../app/engine.js';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {SearchSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {sortFacets} from '../../../utils/facet-utils.js';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller.js';

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

export interface FacetManagerState {
  /**
   * The facet ids sorted in the same order as the latest response.
   */
  facetIds: string[];
}

/**
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 * @returns The `FacetManager` controller instance.
 */
export function buildCoreFacetManager(engine: CoreEngine): FacetManager {
  if (!loadFacetManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    ...controller,

    sort<T>(facets: FacetManagerPayload<T>[]) {
      return sortFacets(facets, this.state.facetIds);
    },

    get state() {
      const facets = getState().search.response.facets;
      const facetIds = facets.map((f) => f.facetId);

      return {facetIds};
    },
  };
}

function loadFacetManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchSection> {
  engine.addReducers({search, facetOptions});
  return true;
}
