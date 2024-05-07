import {Schema} from '@coveo/bueno';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortByFields,
  SortByFieldsFields,
  SortByRelevance,
  SortCriterion,
  SortDirection,
  sortCriterionDefinition,
} from '../../../../features/commerce/sort/sort';
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {loadReducerError} from '../../../../utils/errors';
import {validateInitialState} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {FetchProductsActionCreator} from '../common';

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
 * @internal
 * Creates a core `Sort` controller instance for commerce solution types.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
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
