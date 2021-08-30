import {SortCriterion} from '../../../features/sort-criteria/criteria';
import {
  buildCoreSort,
  Sort,
  SortInitialState,
  SortProps,
  SortState,
} from '../../core/sort/headless-core-sort';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {structuredSort} from '../../../app/reducers';
import {
  ConfigurationSection,
  StructuredSortSection,
} from '../../../state/state-sections';
import {CoreEngine} from '../../../app/engine';
import {loadReducerError} from '../../../utils/errors';

export interface ProductListingSortState extends SortState {
  /**
   * The current sort criteria, in a structured way.
   */
  sort: SortCriterion | SortCriterion[];
}

export interface ProductListingSort extends Sort {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
   * */
  state: ProductListingSortState;
}

export {
  SortInitialState,
  SortProps,
  ProductListingSort as Sort,
  ProductListingSortState as SortState,
};

/**
 * Creates a `Sort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(
  engine: ProductListingEngine,
  props: SortProps = {}
): ProductListingSort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const sort = buildCoreSort(engine, props);
  const getState = () => engine.state;

  return {
    ...sort,

    sortBy(criterion: SortCriterion | SortCriterion[]) {
      sort.sortBy(criterion);
      dispatch(fetchProductListing());
    },

    get state() {
      return {
        ...sort.state,
        sort: getState().sort,
      };
    },
  };
}

function loadSortReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & StructuredSortSection> {
  engine.addReducers({sort: structuredSort});
  return true;
}
