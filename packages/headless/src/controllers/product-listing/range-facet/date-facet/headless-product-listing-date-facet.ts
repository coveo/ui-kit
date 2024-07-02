import {ProductListingEngine} from '../../../../app/product-listing-engine/product-listing-engine';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {getLegacyAnalyticsActionForToggleRangeFacetSelect} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {
  buildCoreDateFacet,
  buildDateRange,
  DateFacet,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet';
import {DateFacetOptions} from '../../../core/facets/range-facet/date-facet/headless-date-facet-options';

export type {
  DateFacetOptions,
  DateFacetValue,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
  DateFacetProps,
  DateFacet,
  DateFacetState,
};
export {buildDateRange};

/**
 * Creates a `DateFacet` controller instance for the product listing.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 */
export function buildDateFacet(
  engine: ProductListingEngine,
  props: DateFacetProps
): DateFacet {
  const coreController = buildCoreDateFacet(engine, props);
  const dispatch = engine.dispatch;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(fetchProductListing());
      dispatch(logFacetUpdateSort({facetId: getFacetId(), criterion}));
    },

    toggleSelect: (selection: DateFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getLegacyAnalyticsActionForToggleRangeFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    get state() {
      return coreController.state;
    },
  };
}
