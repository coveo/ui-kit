import {
  buildCoreCategoryFacet,
  CategoryFacetSearch,
  CategoryFacetValue,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from '../../core/facets/category-facet/headless-core-category-facet';
import {CategoryFacetOptions} from '../../core/facets/category-facet/headless-core-category-facet-options';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../features/insight-search/insight-search-actions';
import {
  categoryFacetSearchSet,
  categoryFacetSet,
  configuration,
  search,
} from '../../../app/reducers';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';

export interface InsightCategoryFacetOptions extends CategoryFacetOptions {}

export interface InsightCategoryFacetProps {
  /**
   * The options for `InsightCategoryFacet` controller
   */
  options: InsightCategoryFacetOptions;
}

export interface InsightCategoryFacet extends CoreCategoryFacet {
  /**
   * Provides methods to search the facet's values.
   */
  facetSearch: CategoryFacetSearch;

  /**
   * The state of the `Facet` controller.
   * */
  state: InsightCategoryFacetState;
}

export interface InsightCategoryFacetState extends CoreCategoryFacetState {}

/**
 * Creates a `InsightCategoryFacet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `InsightCategoryFacet` properties.
 * @returns A `InsightCategoryFacet` controller instance.
 * */
export function buildInsightCategoryFacet(
  engine: InsightEngine,
  props: InsightCategoryFacetProps
): InsightCategoryFacet {
  const coreController = buildCoreCategoryFacet(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;
  const createNoopCategoryFacetSearch = () => {
    return {
      updateText() {},
      showMoreResults() {},
      search() {},
      clear() {},
      updateCaptions() {},
      select() {},
      singleSelect() {},
      get state() {
        return {
          values: [],
          isLoading: false,
          moreValuesAvailable: false,
          query: '',
        };
      },
    };
  };

  const facetSearch = createNoopCategoryFacetSearch();

  const {state, ...restOfFacetSearch} = facetSearch;

  if (!loadInsightCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection: CategoryFacetValue) {
      coreController.toggleSelect(selection);
      const analyticsAction = getToggleSelectInsightAnalyticsAction(
        getFacetId(),
        selection
      );
      dispatch(executeSearch(analyticsAction));
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
      );
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      return coreController.isSortedBy(criterion);
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchFacetValues(logFacetShowMore(getFacetId())));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchFacetValues(logFacetShowLess(getFacetId())));
    },

    get state() {
      return {...coreController.state};
    },
  };
}

function loadInsightCategoryFacetReducers(
  engine: InsightEngine
): engine is InsightEngine<
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

function getToggleSelectInsightAnalyticsAction(
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
