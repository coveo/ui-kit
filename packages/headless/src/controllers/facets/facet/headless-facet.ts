import {executeSearch} from '../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {FacetOptions, FacetSearchOptions} from './headless-facet-options';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  buildCoreFacet,
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetProps,
  FacetSearch,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
} from '../../core/facets/facet/headless-core-facet';
import {CoreEngine} from '../../..';
import {
  facetSet,
  configuration,
  facetSearchSet,
  search,
} from '../../../app/reducers';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';

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
  CoreFacet,
  CoreFacetState,
};

/**
 * Creates a `Facet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 * */
export function buildFacet(engine: SearchEngine, props: FacetProps): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(engine, props);
  const getFacetId = () => coreController.state.facetId;

  const createFacetSearch = () => {
    const {facetSearch} = props.options;

    return buildFacetSearch(engine, {
      options: {facetId: getFacetId(), ...facetSearch},
      select: (value) => {
        dispatch(updateFacetOptions({freezeFacetOrder: true}));
        dispatch(
          executeSearch(
            logFacetSelect({facetId: getFacetId(), facetValue: value.rawValue})
          )
        );
      },
    });
  };

  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection) {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch(
          getAnalyticsActionForToggleFacetSelect(getFacetId(), selection)
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(criterion: FacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(executeSearch(logFacetShowMore(getFacetId())));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(executeSearch(logFacetShowLess(getFacetId())));
    },

    get state() {
      return {
        ...coreController.state,
        facetSearch: facetSearch.state,
      };
    },
  };
}

function loadFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet, search});
  return true;
}
