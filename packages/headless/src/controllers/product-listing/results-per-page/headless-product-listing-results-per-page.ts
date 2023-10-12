import {configuration} from '../../../app/common-reducers.js';
import {logPagerResize} from '../../../features/pagination/pagination-analytics-actions.js';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice.js';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions.js';
import {ProductListingEngine} from '../../../product-listing.index.js';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildCoreResultsPerPage,
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from '../../core/results-per-page/headless-core-results-per-page.js';

export type {
  ResultsPerPage,
  ResultsPerPageProps,
  ResultsPerPageInitialState,
  ResultsPerPageState,
};

/**
 * Creates a `ResultsPerPage` controller instance for the product listing.
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

    set(num: number) {
      coreController.set(num);
      dispatch(fetchProductListing()).then(() => dispatch(logPagerResize()));
    },
  };
}

function loadResultsPerPageReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({pagination, configuration});
  return true;
}
