import {executeSearch} from '../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {FacetOptions, FacetSearchOptions} from './headless-facet-options';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  buildCoreFacet,
  Facet,
  FacetProps,
  FacetSearch,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
} from '../../core/facets/facet/headless-core-facet';

export {
  FacetOptions,
  FacetSearchOptions,
  FacetValueState,
  FacetProps,
  Facet,
  FacetState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  FacetValue,
};

/**
 * Creates a `Facet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 * */
export function buildFacet(engine: SearchEngine, props: FacetProps): Facet {
  const {dispatch} = engine;
  const controller = buildCoreFacet(engine, props);
  const getFacetId = () => controller.state.facetId;

  return {
    ...controller,

    deselectAll() {
      controller.deselectAll();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(criterion: FacetSortCriterion) {
      controller.sortBy(criterion);
      dispatch(
        executeSearch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      controller.showMoreValues();
      dispatch(executeSearch(logFacetShowMore(getFacetId())));
    },

    showLessValues() {
      controller.showLessValues();
      dispatch(executeSearch(logFacetShowLess(getFacetId())));
    },

    get state() {
      return {
        ...controller.state,
      };
    },
  };
}
