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
import {buildCategoryFacetSearch} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';

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

  const coreController = buildCoreCategoryFacet(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;

  const createFacetSearch = () => {
    const {facetSearch} = props.options;

    return buildCategoryFacetSearch(engine, {
      options: {
        facetId: getFacetId(),
        ...facetSearch,
      },
      select: (value) => {
        dispatch(updateFacetOptions({freezeFacetOrder: true}));
        dispatch(fetchProductListing()).then(() =>
          logFacetSelect({facetId: getFacetId(), facetValue: value.rawValue})
        );
      },
    });
  };

  const facetSearch = createFacetSearch();
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
