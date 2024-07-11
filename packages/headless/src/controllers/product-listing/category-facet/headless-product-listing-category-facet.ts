import {configuration} from '../../../app/common-reducers';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetValueCommon} from '../../../features/facets/category-facet-set/interfaces/commons';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {productListingReducer as productListing} from '../../../features/product-listing/product-listing-slice';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  OldProductListingSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
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
} from '../../core/facets/category-facet/headless-core-category-facet';
import {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
} from '../../core/facets/category-facet/headless-core-category-facet-options';
import {buildCategoryFacetSearch} from '../../facets/category-facet/headless-category-facet-search';

export type {
  CategoryFacetValue,
  CategoryFacetValueCommon,
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
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CategoryFacet` properties.
 * @returns A `CategoryFacet` controller instance.
 * */
export function buildCategoryFacet(
  engine: ProductListingEngine,
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
      dispatch(fetchProductListing()).then(() =>
        logFacetSelect({facetId: getFacetId(), facetValue: value.rawValue})
      );
    },
    isForFieldSuggestions: false,
  });

  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect: (selection: CategoryFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(getToggleSelectAnalyticsAction(getFacetId(), selection));
    },

    deselectAll: () => {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(fetchProductListing());
      dispatch(logFacetUpdateSort({facetId: getFacetId(), criterion}));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowMore(getFacetId()));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowLess(getFacetId()));
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
  engine: ProductListingEngine
): engine is ProductListingEngine<
  CategoryFacetSection &
    CategoryFacetSearchSection &
    ConfigurationSection &
    OldProductListingSection
> {
  engine.addReducers({
    categoryFacetSet,
    categoryFacetSearchSet,
    configuration,
    productListing,
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
