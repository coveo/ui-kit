import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../features/commerce/product-listing/product-listing-slice';
import {configurationReducer as configuration} from '../../../../../features/configuration/configuration-slice';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
} from '../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {getProductListingAnalyticsActionForToggleFacetSelect} from '../../../../../features/facets/facet-set/facet-set-product-listing-v2-utils';
import {
  CategoryFacetSection,
  ConfigurationSection,
  ProductListingV2Section,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  CategoryFacetOptions,
  CategoryFacetValue,
  CoreCategoryFacet,
  CoreCategoryFacetState,
  buildCoreCategoryFacet,
} from '../../../../core/facets/category-facet/headless-core-category-facet';

/**
 * The `ProductListingCategoryFacet` headless controller offers a high-level interface for designing a facet UI component that renders values hierarchically.
 */
export type ProductListingCategoryFacet = Omit<
  CoreCategoryFacet,
  'disable' | 'enable' | 'isSortedBy' | 'sortBy' | 'state'
> & {state: ProductListingCategoryFacetState};

/**
 * A scoped and simplified part of the headless state that is relevant to the `ProductListingCategoryFacet` controller.
 */
export type ProductListingCategoryFacetState = Omit<
  CoreCategoryFacetState,
  'enabled' | 'parents' | 'sortCriteria' | 'values'
>;

export interface ProductListingCategoryFacetProps {
  /**
   * The options for the `ProductListingCategoryFacet` controller.
   */
  options: ProductListingCategoryFacetOptions;
}

export type ProductListingCategoryFacetOptions = Pick<
  CategoryFacetOptions,
  'facetId' | 'field' | 'numberOfValues'
>;

/**
 * Creates a `ProductListingCategoryFacet` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ProductListingCategoryFacet` properties.
 * @returns A `ProductListingCategoryFacet` controller instance.
 * */
export function buildProductListingCategoryFacet(
  engine: CommerceEngine,
  props: ProductListingCategoryFacetProps
): ProductListingCategoryFacet {
  if (!loadProductListingCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreConroller = buildCoreCategoryFacet(engine, props);
  const {disable, enable, isSortedBy, sortBy, ...restOfCoreController} =
    coreConroller;
  const getFacetId = (): string => coreConroller.state.facetId;

  return {
    ...restOfCoreController,

    toggleSelect(selection: CategoryFacetValue) {
      coreConroller.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    deselectAll() {
      coreConroller.deselectAll();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetClearAll(getFacetId()))
      );
    },

    showMoreValues() {
      coreConroller.showMoreValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowMore(getFacetId()))
      );
    },

    showLessValues() {
      coreConroller.showLessValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowLess(getFacetId()))
      );
    },

    get state() {
      const {enabled, parents, sortCriteria, values, ...state} =
        coreConroller.state;
      return state;
    },
  };
}

function loadProductListingCategoryFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  ConfigurationSection & CategoryFacetSection & ProductListingV2Section
> {
  engine.addReducers({
    configuration,
    productListing,
    categoryFacetSet,
  });
  return true;
}
