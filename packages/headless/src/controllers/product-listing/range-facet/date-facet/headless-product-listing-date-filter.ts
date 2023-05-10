import {configuration} from '../../../../app/common-reducers';
import {ProductListingEngine} from '../../../../app/product-listing-engine/product-listing-engine';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCoreDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-filter';

export type {
  DateFilterOptions,
  DateFilterInitialState,
  DateFilterRange,
  DateFilterProps,
  DateFilterState,
  DateFilter,
};

export function buildDateFilter(
  engine: ProductListingEngine,
  props: DateFilterProps
): DateFilter {
  if (!loadDateFilterReducer(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreDateFilter(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,
    clear: () => {
      coreController.clear();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetClearAll(getFacetId()))
      );
    },
    setRange: (range) => {
      const success = coreController.setRange(range);
      if (success) {
        dispatch(fetchProductListing()).then(() =>
          dispatch(
            logFacetSelect({
              facetId: getFacetId(),
              facetValue: `${range.start}..${range.end}`,
            })
          )
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

function loadDateFilterReducer(
  engine: ProductListingEngine
): engine is ProductListingEngine<
  DateFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({dateFacetSet, configuration, search});
  return true;
}
