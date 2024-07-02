import {configuration} from '../../../../app/common-reducers';
import {ProductListingEngine} from '../../../../app/product-listing-engine/product-listing-engine';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {getLegacyAnalyticsActionForToggleRangeFacetSelect} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {NumericRangeRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCoreNumericFacet,
  buildNumericRange,
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetValue,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacet,
  NumericFacetState,
};
export {buildNumericRange};

/**
 * Creates a `NumericFacet` controller instance for the product listing.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 *
 * @param engine - The headless engine.
 * @param props - The configurable `NumericFacet` properties.
 * @returns A `NumericFacet` controller instance.
 */
export function buildNumericFacet(
  engine: ProductListingEngine,
  props: NumericFacetProps
): NumericFacet {
  if (!loadNumericFacetReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreNumericFacet(engine, props);
  const dispatch = engine.dispatch;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,

    async deselectAll() {
      coreController.deselectAll();
      await dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },

    async sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      await dispatch(fetchProductListing());
      dispatch(logFacetUpdateSort({facetId: getFacetId(), criterion}));
    },

    toggleSelect: async (selection: NumericFacetValue) => {
      coreController.toggleSelect(selection);
      await dispatch(fetchProductListing());
      dispatch(
        getLegacyAnalyticsActionForToggleRangeFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}

function loadNumericFacetReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
