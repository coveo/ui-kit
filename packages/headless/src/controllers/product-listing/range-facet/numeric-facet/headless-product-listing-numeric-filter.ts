import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {configuration, numericFacetSet, search} from '../../../../app/reducers';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';

import {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
  buildCoreNumericFilter,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter';
import {ProductListingEngine} from '../../../../product-listing.index';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';

export {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
};

export function buildNumericFilter(
  engine: ProductListingEngine,
  props: NumericFilterProps
): NumericFilter {
  if (!loadNumericFilterReducer(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreNumericFilter(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,
    clear: () => {
      coreController.clear();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },
    setRange: (range) => {
      const success = coreController.setRange(range);
      if (success) {
        dispatch(fetchProductListing());
        dispatch(
          logFacetSelect({
            facetId: getFacetId(),
            facetValue: `${range.start}..${range.end}`,
          })
        );
      }
      return success;
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}

function loadNumericFilterReducer(
  engine: ProductListingEngine
): engine is ProductListingEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
