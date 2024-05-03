import {InsightEngine} from '../../../../app/insight-engine/insight-engine';
import {CategoryFacetSortCriterion} from '../../../../features/facets/category-facet-set/interfaces/request';
import {
  facetClearAll,
  facetDeselect,
  facetSelect,
  facetShowLess,
  facetShowMore,
  facetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions';
import {SearchAction} from '../../../../features/search/search-actions';
import {
  buildCoreCategoryFacet,
  CategoryFacet,
  CategoryFacetOptions,
  CategoryFacetProps,
  CategoryFacetSearch,
  CategoryFacetSearchOptions,
  CategoryFacetSearchResult,
  CategoryFacetSearchState,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetValueCommon,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from '../../../core/facets/category-facet/headless-core-category-facet';

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

  const {state, ...restOfFacetSearch} = facetSearch;

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
          next: facetUpdateSort(),
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
          next: facetShowMore(),
        })
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(
        fetchFacetValues({
          legacy: logFacetShowLess(getFacetId()),
          next: facetShowLess(),
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

export function getToggleSelectAnalyticsAction(
  selection: CategoryFacetValue
): SearchAction {
  const isSelected = selection.state === 'selected';
  return isSelected ? facetDeselect() : facetSelect();
}
