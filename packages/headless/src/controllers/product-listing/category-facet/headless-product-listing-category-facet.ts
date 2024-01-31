import {configuration} from '../../../app/common-reducers';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetValueCommon} from '../../../features/facets/category-facet-set/interfaces/commons';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
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
  ProductListingSection,
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
import {buildCategoryFacetSearch} from './headless-product-listing-category-facet-search';

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
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetClearAll(getFacetId()))
      );
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
      );
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowMore(getFacetId()))
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowLess(getFacetId()))
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

function loadCategoryFacetReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine<
  CategoryFacetSection &
    CategoryFacetSearchSection &
    ConfigurationSection &
    ProductListingSection
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
