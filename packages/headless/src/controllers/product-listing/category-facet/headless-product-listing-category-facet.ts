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
  ProductListingSection,
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
  productListing,
} from '../../../app/reducers';
import {loadReducerError} from '../../../utils/errors';
import {
  buildCoreCategoryFacet,
  CategoryFacet,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
} from '../../core/facets/category-facet/headless-core-category-facet';
import {ProductListingEngine} from '../../../product-listing.index';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';

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
  engine: ProductListingEngine,
  props: CategoryFacetProps
): CategoryFacet {
  if (!loadCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildCoreCategoryFacet(engine, props);
  const {dispatch} = engine;
  const facetId = determineFacetId(engine, props.options);

  return {
    ...controller,

    toggleSelect: (selection: CategoryFacetValue) => {
      controller.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(getToggleSelectAnalyticsAction(facetId, selection));
    },

    deselectAll: () => {
      controller.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(facetId));
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      controller.sortBy(criterion);
      dispatch(fetchProductListing());
      dispatch(logFacetUpdateSort({facetId, criterion}));
    },

    showMoreValues() {
      controller.showMoreValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowMore(facetId));
    },

    showLessValues() {
      controller.showLessValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowLess(facetId));
    },

    get state() {
      return {
        ...controller.state,
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
