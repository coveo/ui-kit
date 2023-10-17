import {Schema} from '@coveo/bueno';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {CoreEngine} from '../../../../app/engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {applySort} from '../../../../features/commerce/product-listing/sort/product-listing-sort-actions';
import {sortReducer as sort} from '../../../../features/commerce/product-listing/sort/product-listing-sort-slice';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {
  SortByFields,
  SortCriterion,
  sortCriterionDefinition,
  SortByFieldsFields,
  SortByRelevance,
  SortBy,
  buildRelevanceSortCriterion,
  SortDirection,
  buildFieldsSortCriterion,
} from '../../../../features/sort/sort';
import {ProductListingV2Section} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {validateInitialState} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';

export type {SortByRelevance, SortByFields, SortByFieldsFields, SortCriterion};
export {
  SortBy,
  SortDirection,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
};

export interface SortProps {
  /**
   * The initial state that should be applied to this `Sort` controller.
   */
  initialState?: SortInitialState;
}

export interface SortInitialState {
  /**
   * The initial sort criterion to register in state.
   */
  criterion?: SortCriterion;
}

function validateSortInitialState(
  engine: CoreEngine<ProductListingV2Section>,
  state: SortInitialState | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<SortInitialState>({
    criterion: sortCriterionDefinition,
  });

  validateInitialState(engine, schema, state, 'buildSort');
}

export interface Sort extends Controller {
  /**
   * Updates the sort criterion and executes a new query.
   *
   * @param criterion - The new sort criterion.
   */
  sortBy(criterion: SortCriterion): void;

  /**
   * Checks whether the specified sort criterion matches the value in state.
   *
   * @param criterion - The criterion to compare.
   * @returns `true` if the passed sort criterion matches the value in state, and `false` otherwise.
   */
  isSortedBy(criterion: SortCriterion): boolean;

  /**
   * Checks whether the specified sort criterion is available.
   *
   * @param criterion - The criterion to check for.
   * @returns `true` if the passed sort criterion is available, and `false` otherwise.
   */
  isAvailable(criterion: SortCriterion): boolean;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
   */
  state: SortState;
}

export interface SortState {
  /**
   * The current sort criterion.
   */
  appliedSort: SortCriterion;

  /**
   * The available sort criteria.
   */
  availableSorts: SortCriterion[];
}

/**
 * Creates a `Sort` controller instance for the product listing.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(engine: CommerceEngine, props: SortProps = {}): Sort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state.productListing;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(applySort(criterion));
  }

  return {
    ...controller,

    get state() {
      return getState().sort;
    },

    sortBy(criterion: SortCriterion) {
      dispatch(applySort(criterion));
      dispatch(updatePage(0));
      dispatch(fetchProductListing());
    },

    isSortedBy(criterion: SortCriterion) {
      return this.state.appliedSort === criterion;
    },

    isAvailable(criterion: SortCriterion) {
      return this.state.availableSorts.some(
        (availableCriterion) =>
          JSON.stringify(availableCriterion) === JSON.stringify(criterion)
      );
    },
  };
}

function loadSortReducers(
  engine: CoreEngine
): engine is CoreEngine<ProductListingV2Section> {
  engine.addReducers({productListing, sort});
  return true;
}
