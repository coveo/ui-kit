import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {sortFacets} from '../../utils/facet-utils';
import {buildController} from '../controller/headless-controller';

export type FacetManagerPayload<T> = {
  facetId: string;
  payload: T;
};

export type FacetManager = ReturnType<typeof buildFacetManager>;
export type FacetManagerState = FacetManager['state'];

export function buildFacetManager(engine: Engine<SearchSection>) {
  const controller = buildController(engine);

  return {
    ...controller,

    /** Sorts the facets to match the order in the most recent search response.
     * @param FacetManagerPayload[] An array of facet payloads to sort.
     * @returns FacetManagerPayload[].
     */
    sort<T>(facets: FacetManagerPayload<T>[]) {
      return sortFacets(facets, this.state.facetIds);
    },

    /** @returns The state of the `FacetManager` controller. */
    get state() {
      const facets = engine.state.search.response.facets;
      const facetIds = facets.map((f) => f.facetId);

      return {facetIds};
    },
  };
}
