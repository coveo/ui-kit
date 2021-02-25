import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {sortFacets} from '../../utils/facet-utils';
import {buildController, Controller} from '../controller/headless-controller';

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
   * The state of the `FacetManager` controller.
   * */
  state: FacetManagerState;
}

export interface FacetManagerState {
  /**
   * The facet ids sorted in the same order as the latest response.
   */
  facetIds: string[];
}

/**
 * Creates a `FacetManger` instance.
 *
 * @param engine - The headless engine.
 */
export function buildFacetManager(engine: Engine<SearchSection>): FacetManager {
  const controller = buildController(engine);

  return {
    ...controller,

    sort<T>(facets: FacetManagerPayload<T>[]) {
      return sortFacets(facets, this.state.facetIds);
    },

    get state() {
      const facets = engine.state.search.response.facets;
      const facetIds = facets.map((f) => f.facetId);

      return {facetIds};
    },
  };
}
