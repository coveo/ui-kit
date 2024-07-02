import {Schema} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  sortCriterionDefinition,
  SortDirection,
  SortBy,
  SortByRelevance,
  SortByFieldsFields,
  SortByFields,
  SortCriterion,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
} from '../../../features/sort/sort';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort/sort-actions';
import {sortReducer as sort} from '../../../features/sort/sort-slice';
import {
  ConfigurationSection,
  StructuredSortSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export type {SortByRelevance, SortByFields, SortByFieldsFields, SortCriterion};
export {
  SortBy,
  SortDirection,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
};

/**
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductListingSortProps {
  /**
   * The initial state that should be applied to this `Sort` controller.
   */
  initialState?: ProductListingSortInitialState;
}

/**
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductListingSortInitialState {
  /**
   * The initial sort criterion to register in state.
   */
  criterion?: SortCriterion;
}

function validateSortInitialState(
  engine: CoreEngine<ConfigurationSection & StructuredSortSection>,
  state: ProductListingSortInitialState | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<ProductListingSortInitialState>({
    criterion: sortCriterionDefinition,
  });

  validateInitialState(engine, schema, state, 'buildSort');
}

/**
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductListingSort extends Controller {
  /**
   * Updates the sort criterion and executes a new query.
   *
   * @param criterion - The new sort criterion.
   */
  sortBy(criterion: SortCriterion): void;

  /**
   * Verifies whether the specified sort criterion is the currently active one.
   *
   * @param criterion - The sort criterion to evaluate.
   * @returns `true` if the specified sort criterion is the currently active one; `false` otherwise.
   */
  isSortedBy(criterion: SortCriterion): boolean;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
   */
  state: ProductListingSortState;
}

/**
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductListingSortState {
  /**
   * The current sort criterion.
   */
  sort: SortCriterion;
}

/**
 * Creates a `Sort` controller instance for the product listing.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(
  engine: ProductListingEngine,
  props: ProductListingSortProps = {}
): ProductListingSort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(registerSortCriterion(criterion));
  }

  return {
    ...controller,

    sortBy(criterion: SortCriterion) {
      dispatch(updateSortCriterion(criterion));
      dispatch(updatePage(1));
      dispatch(fetchProductListing());
    },

    isSortedBy(criterion: SortCriterion) {
      return this.state.sort === criterion;
    },

    get state() {
      return {
        sort: getState().sort,
      };
    },
  };
}

function loadSortReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & StructuredSortSection> {
  engine.addReducers({configuration, sort});
  return true;
}
