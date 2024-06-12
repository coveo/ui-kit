import {configuration} from '../../../app/common-reducers';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {logPagerResize} from '../../../features/pagination/pagination-analytics-actions';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildCoreResultsPerPage,
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from '../../core/results-per-page/headless-core-results-per-page';

export type {
  ResultsPerPage,
  ResultsPerPageProps,
  ResultsPerPageInitialState,
  ResultsPerPageState,
};

/**
 * Creates a `ResultsPerPage` controller instance for the product listing.
 * @deprecated TBD CAPI-98
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
 */
export function buildResultsPerPage(
  engine: ProductListingEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  if (!loadResultsPerPageReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreResultsPerPage(engine, props);
  const {dispatch} = engine;

  return {
    ...coreController,

    get state() {
      return {
        ...coreController.state,
      };
    },

    async set(num: number) {
      coreController.set(num);
      await dispatch(fetchProductListing());
      dispatch(logPagerResize());
    },
  };
}

function loadResultsPerPageReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({pagination, configuration});
  return true;
}
