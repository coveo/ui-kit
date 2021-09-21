import {executeSearch} from '../../../features/search/search-actions';
import {
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
} from '../../core/facets/category-facet/headless-core-category-facet-options';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
import {
  categoryFacetSearchSet,
  categoryFacetSet,
  configuration,
  search,
} from '../../../app/reducers';
import {loadReducerError} from '../../../utils/errors';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  buildCoreCategoryFacet,
  CategoryFacet,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
} from '../../core/facets/category-facet/headless-core-category-facet';

export {
  CategoryFacetValue,
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
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
  const facetId = determineFacetId(engine, props.options);

  return {
    ...coreController,

    toggleSelect: (selection: CategoryFacetValue) => {
      coreController.toggleSelect(selection);
      const analyticsAction = getToggleSelectAnalyticsAction(
        facetId,
        selection
      );
      dispatch(executeSearch(analyticsAction));
    },

    deselectAll: () => {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    get state() {
      return {
        ...coreController.state,
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

function getToggleSelectAnalyticsAction(
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
