import {CoreEngine} from '../../../../app/engine';
import {validateInitialState} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {loadReducerError} from '../../../../utils/errors';
import {ProductListingV2Section} from '../../../../state/state-sections';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {Schema} from '@coveo/bueno';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  SortByFields,
  SortByRelevance,
  SortBy,
  SortCriterion,
  SortDirection,
  SortByFieldsFields,
  sortCriterionDefinition,
} from '../../../../features/commerce/sort/sort';

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
  const getState = () => engine.state;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(applySort(criterion));
  }

  return {
    ...controller,

    get state() {
      return getState().commerceSort;
    },

    sortBy(criterion: SortCriterion) {
      dispatch(applySort(criterion));
      dispatch(updatePage(0));
      dispatch(fetchProductListing());
    },

    isSortedBy(criterion: SortCriterion) {
      return (
        JSON.stringify(this.state.appliedSort) === JSON.stringify(criterion)
      );
    },

    isAvailable(criterion: SortCriterion) {
      return this.state.availableSorts.some(
        (availableCriterion) =>
          JSON.stringify(availableCriterion) === JSON.stringify(criterion)
      );
    },
  };
}

function loadSortReducers(engine: CommerceEngine): engine is CommerceEngine {
  engine.addReducers({productListing, commerceSort});
  return true;
}
