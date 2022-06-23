import {
  buildCoreCategoryFacet,
  CategoryFacetSearch,
  CategoryFacetValue,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from '../../core/facets/category-facet/headless-core-category-facet';
import {CategoryFacetOptions} from '../../core/facets/category-facet/headless-core-category-facet-options';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {InsightEngine} from '../../../insight.index';
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

export interface InsightCategoryFacetOptions extends CategoryFacetOptions {}

export interface InsightCategoryFacetProps {
  /**
   * The options for  `InsightCategoryFacet` controller
   */
  options: InsightCategoryFacetOptions;
}

export interface InsightCategoryFacet extends CoreCategoryFacet {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: CategoryFacetValue): void;

  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;

  /**
   * Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion by which to sort values.
   */
  sortBy(criterion: CategoryFacetSortCriterion): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: CategoryFacetSortCriterion): boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues(): void;

  /**
   * Sets the number of values displayed in the facet to the originally configured value.
   * */
  showLessValues(): void;

  /**
   * Enables the facet. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the facet. I.e., prevents it from filtering results.
   */
  disable(): void;

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

    enable() {
      coreController.enable();
    },

    disable() {
      coreController.disable();
    },

    get state() {
      return {
        ...coreController.state,
      };
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
