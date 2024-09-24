import {configuration} from '../../../app/common-reducers.js';
import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../features/facets/category-facet-set/category-facet-set-slice.js';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request.js';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  facetUpdateSort,
  facetClearAll,
  facetDeselect,
  facetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  SearchAction,
  executeSearch,
  fetchFacetValues,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
} from '../../core/facets/category-facet/headless-core-category-facet-options.js';
import {
  buildCoreCategoryFacet,
  CategoryFacet,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from '../../core/facets/category-facet/headless-core-category-facet.js';
import {buildCategoryFacetSearch} from './headless-category-facet-search.js';

export type {
  CategoryFacetValue,
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
};

/**
 * Creates a `CategoryFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CategoryFacet` properties.
 * @returns A `CategoryFacet` controller instance.
 * */
export function buildCategoryFacet(
  engine: SearchEngine,
  props: CategoryFacetProps
): CategoryFacet {
  if (!loadCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreCategoryFacet(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;
  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {
      facetId: getFacetId(),
      ...props.options.facetSearch,
    },
    executeFacetSearchActionCreator: executeFacetSearch,
    executeFieldSuggestActionCreator: executeFieldSuggest,
    select: (value: CategoryFacetSearchResult) => {
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
    isForFieldSuggestions: false,
  });

  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection: CategoryFacetValue) {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyToggleSelectAnalyticsAction(getFacetId(), selection),
          next: getToggleSelectAnalyticsAction(selection),
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

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), criterion}),
          next: facetUpdateSort(),
        })
      );
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

function loadCategoryFacetReducers(
  engine: SearchEngine
): engine is SearchEngine<
  CategoryFacetSection &
    CategoryFacetSearchSection &
    ConfigurationSection &
    SearchSection
> {
  engine.addReducers({
    categoryFacetSet,
    categoryFacetSearchSet,
    configuration,
    search,
  });
  return true;
}

function getLegacyToggleSelectAnalyticsAction(
  facetId: string,
  selection: CategoryFacetValue
) {
  const payload = {
    facetId,
    facetValue: selection.value,
  };

  const isSelected = selection.state === 'selected';
  return isSelected ? logFacetDeselect(payload) : logFacetSelect(payload);
}

function getToggleSelectAnalyticsAction(
  selection: CategoryFacetValue
): SearchAction {
  const isSelected = selection.state === 'selected';
  return isSelected ? facetDeselect() : facetSelect();
}
