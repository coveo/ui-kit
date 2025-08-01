import {Schema} from '@coveo/bueno';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  type SortByFields,
  type SortByFieldsFields,
  type SortByRelevance,
  type SortCriterion,
  SortDirection,
  sortCriterionDefinition,
} from '../../../../features/commerce/sort/sort.js';
import {applySort} from '../../../../features/commerce/sort/sort-actions.js';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {validateInitialState} from '../../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import type {FetchProductsActionCreator} from '../common.js';

export type {SortByRelevance, SortByFields, SortByFieldsFields, SortCriterion};
export {
  SortBy,
  SortDirection,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
};

export interface SortProps {
  /**
   * The initial state that should be applied to this `Sort` sub-controller.
   */
  initialState?: SortInitialState;
}

export interface CoreSortProps extends SortProps {
  fetchProductsActionCreator: FetchProductsActionCreator;
}

export interface SortInitialState {
  /**
   * The initial sort criterion to register in state.
   */
  criterion?: SortCriterion;
}

function validateSortInitialState(
  engine: CommerceEngine,
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

/**
 * The `Sort` sub-controller lets you sort the products in a commerce interface.
 *
 * @group Sub-controllers
 * @category Sort
 */
export interface Sort extends Controller {
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
   * Verifies whether the specified sort criterion is available.
   *
   * @param criterion - The sort criterion to look for.
   * @returns `true` if the specified sort criterion is available; `false` otherwise.
   */
  isAvailable(criterion: SortCriterion): boolean;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Sort` sub-controller.
   */
  state: SortState;
}

/**
 * The state of the `Sort` sub-controller.
 *
 * @group Sub-controllers
 * @category Sort
 */
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
 * @internal
 * Creates a core `Sort` sub-controller instance for commerce solution types.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Sort` sub-controller properties.
 * @returns A `Sort` sub-controller instance.
 */
export function buildCoreSort(
  engine: CommerceEngine,
  props: CoreSortProps
): Sort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(applySort(criterion));
  }

  return {
    ...controller,

    get state() {
      return engine[stateKey].commerceSort;
    },

    sortBy(criterion: SortCriterion) {
      dispatch(applySort(criterion));
      dispatch(props.fetchProductsActionCreator());
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
  engine.addReducers({commerceSort});
  return true;
}
