import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {
  facetSelect,
  facetUpdateSort,
  facetClearAll,
  facetExclude,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {
  // getLegacyAnalyticsActionForToggleFacetExclude,
  // getLegacyAnalyticsActionForToggleFacetSelect,
  getAnalyticsActionForToggleFacetExclude,
  getAnalyticsActionForToggleFacetSelect,
} from '../../../features/facets/facet-set/facet-set-utils';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../features/search/search-actions';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {
  buildCoreFacet,
  Facet,
  FacetSearch,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
  CoreFacet,
  CoreFacetState,
} from '../../core/facets/facet/headless-core-facet';
import {
  FacetOptions,
  FacetSearchOptions,
  facetOptionsSchema,
} from './headless-facet-options';

export type {
  FacetOptions,
  FacetSearchOptions,
  FacetValueState,
  Facet,
  FacetState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  FacetValue,
  CoreFacet,
  CoreFacetState,
};

export interface FacetProps {
  /**
   * The options for the `Facet` controller.
   * */
  options: FacetOptions;
}

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
  const coreController = buildCoreFacet(
    engine,
    {
      ...props,
      options: {
        ...props.options,
        ...(props.options.allowedValues && {
          allowedValues: {
            type: 'simple',
            values: props.options.allowedValues,
          },
        }),
      },
    },
    facetOptionsSchema
  );
  const getFacetId = () => coreController.state.facetId;

  const createFacetSearch = () => {
    const {facetSearch} = props.options;

    return buildFacetSearch(engine, {
      options: {facetId: getFacetId(), ...facetSearch},
      select: (value) => {
        dispatch(updateFacetOptions());
        dispatch(
          executeSearch({
            next: facetSelect(),
          })
        );
      },
      exclude: (value) => {
        dispatch(updateFacetOptions());
        dispatch(
          executeSearch({
            next: facetExclude(),
          })
        );
      },
      isForFieldSuggestions: false,
      executeFacetSearchActionCreator: executeFacetSearch,
      executeFieldSuggestActionCreator: executeFieldSuggest,
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
        executeSearch({
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    toggleExclude(selection) {
      coreController.toggleExclude(selection);
      dispatch(
        executeSearch({
          next: getAnalyticsActionForToggleFacetExclude(selection),
        })
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(
        executeSearch({
          next: facetClearAll(),
        })
      );
    },

    sortBy(criterion: FacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          next: facetUpdateSort(),
        })
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      coreController.showMoreValues();
    },

    showLessValues() {
      coreController.showLessValues();
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
