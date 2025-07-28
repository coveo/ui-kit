import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import type {FacetValueState} from '../../../features/facets/facet-api/value.js';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  facetClearAll,
  facetExclude,
  facetSelect,
  logFacetClearAll,
  logFacetExclude,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice.js';
import {
  getAnalyticsActionForToggleFacetExclude,
  getAnalyticsActionForToggleFacetSelect,
  getLegacyAnalyticsActionForToggleFacetExclude,
  getLegacyAnalyticsActionForToggleFacetSelect,
} from '../../../features/facets/facet-set/facet-set-utils.js';
import type {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildCoreFacet,
  type CoreFacet,
  type CoreFacetState,
  type Facet,
  type FacetSearch,
  type FacetSearchState,
  type FacetState,
  type FacetValue,
  type SpecificFacetSearchResult,
} from '../../core/facets/facet/headless-core-facet.js';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search.js';
import {
  type FacetOptions,
  type FacetSearchOptions,
  facetOptionsSchema,
} from './headless-facet-options.js';

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
 *
 * @group Controllers
 * @category Facet
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
            legacy: logFacetSelect({
              facetId: getFacetId(),
              facetValue: value.rawValue,
            }),
            next: facetSelect(),
          })
        );
      },
      exclude: (value) => {
        dispatch(updateFacetOptions());
        dispatch(
          executeSearch({
            legacy: logFacetExclude({
              facetId: getFacetId(),
              facetValue: value.rawValue,
            }),
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
  const {state: _state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection) {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleFacetSelect(
            getFacetId(),
            selection
          ),
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    toggleExclude(selection) {
      coreController.toggleExclude(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleFacetExclude(
            getFacetId(),
            selection
          ),
          next: getAnalyticsActionForToggleFacetExclude(selection),
        })
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(getFacetId()),
          next: facetClearAll(),
        })
      );
    },

    sortBy(criterion: FacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), criterion}),
        })
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchFacetValues({legacy: logFacetShowMore(getFacetId())}));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchFacetValues({legacy: logFacetShowLess(getFacetId())}));
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
