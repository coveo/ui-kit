import type {InsightEngine} from '../../../../app/insight-engine/insight-engine.js';
import type {CategoryFacetSortCriterion} from '../../../../features/facets/category-facet-set/interfaces/request.js';
import {
  facetClearAll,
  facetDeselect,
  facetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions.js';
import type {SearchAction} from '../../../../features/search/search-actions.js';
import {
  buildCoreCategoryFacet,
  type CategoryFacet,
  type CategoryFacetOptions,
  type CategoryFacetProps,
  type CategoryFacetSearch,
  type CategoryFacetSearchOptions,
  type CategoryFacetSearchResult,
  type CategoryFacetSearchState,
  type CategoryFacetState,
  type CategoryFacetValue,
  type CategoryFacetValueCommon,
  type CoreCategoryFacet,
  type CoreCategoryFacetState,
} from '../../../core/facets/category-facet/headless-core-category-facet.js';

export type {
  CategoryFacetValueCommon,
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
 * Creates an insight `CategoryFacet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `CategoryFacet` properties.
 * @returns A `CategoryFacet` controller instance.
 *
 * @group Controllers
 * @category CategoryFacet
 * */
export function buildCategoryFacet(
  engine: InsightEngine,
  props: CategoryFacetProps
): CategoryFacet {
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

  const {state: _state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection: CategoryFacetValue) {
      coreController.toggleSelect(selection);
      const analyticsAction = getToggleSelectInsightAnalyticsAction(
        getFacetId(),
        selection
      );
      dispatch(
        executeSearch({
          legacy: analyticsAction,
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
          legacy: logFacetUpdateSort({
            facetId: getFacetId(),
            sortCriterion: criterion,
          }),
        })
      );
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      return coreController.isSortedBy(criterion);
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(
        fetchFacetValues({
          legacy: logFacetShowMore(getFacetId()),
        })
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(
        fetchFacetValues({
          legacy: logFacetShowLess(getFacetId()),
        })
      );
    },

    get state() {
      return {
        ...coreController.state,
        facetSearch: facetSearch.state,
      };
    },
  };
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

function getToggleSelectAnalyticsAction(
  selection: CategoryFacetValue
): SearchAction {
  const isSelected = selection.state === 'selected';
  return isSelected ? facetDeselect() : facetSelect();
}
