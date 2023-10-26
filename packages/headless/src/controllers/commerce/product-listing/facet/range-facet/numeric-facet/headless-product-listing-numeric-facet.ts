import {CommerceEngine} from '../../../../../../app/commerce-engine/commerce-engine';
import {getAnalyticsActionForToggleProductListingRangeFacetSelect} from '../../../../../../features/commerce/facets/range-facets/commerce-range-facet-utils';
import {fetchProductListing} from '../../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../../features/commerce/product-listing/product-listing-slice';
import {configurationReducer as configuration} from '../../../../../../features/configuration/configuration-slice';
import {logFacetClearAll} from '../../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {
  ConfigurationSection,
  NumericFacetSection,
  ProductListingV2Section,
} from '../../../../../../state/state-sections';
import {loadReducerError} from '../../../../../../utils/errors';
import {
  NumericFacet as CoreNumericFacet,
  NumericFacetState as CoreNumericFacetState,
  NumericFacetOptions as CoreNumericFacetOptions,
  buildCoreNumericFacet,
  NumericFacetValue,
} from '../../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';

export type ProductListingNumericFacet = Omit<
  CoreNumericFacet,
  | 'disable'
  | 'enable'
  | 'isSortedBy'
  | 'isValueSelected'
  | 'sortBy'
  | 'state'
  | 'toggleSingleSelect'
> & {state: ProductListingNumericFacetState};

export type ProductListingNumericFacetState = Omit<
  CoreNumericFacetState,
  'sortCriterion' | 'enabled'
>;

export interface ProductListingNumericFacetProps {
  options: ProductListingNumericFacetOptions;
}

export type ProductListingNumericFacetOptions = Pick<
  CoreNumericFacetOptions,
  | 'currentValues'
  | 'facetId'
  | 'field'
  | 'generateAutomaticRanges'
  | 'numberOfValues'
>;

export function buildProductListingNumericFacet(
  engine: CommerceEngine,
  props: ProductListingNumericFacetProps
): ProductListingNumericFacet {
  if (!loadProductListingNumericFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreNumericFacet(engine, props);
  const {
    disable,
    enable,
    isSortedBy,
    isValueSelected,
    sortBy,
    toggleSingleSelect,
    ...restOfCoreController
  } = coreController;

  const getFacetId = (): string => coreController.state.facetId;

  return {
    ...restOfCoreController,

    toggleSelect(selection: NumericFacetValue) {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getAnalyticsActionForToggleProductListingRangeFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetClearAll(getFacetId()))
      );
    },

    get state() {
      const {enabled, sortCriterion, ...state} = coreController.state;
      return state;
    },
  };
}

function loadProductListingNumericFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  ConfigurationSection & NumericFacetSection & ProductListingV2Section
> {
  engine.addReducers({
    configuration,
    productListing,
    numericFacetSet,
  });
  return true;
}
