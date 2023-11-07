import {Schema} from '@coveo/bueno';
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
} from '../../../features/commerce/sort/sort';
import {applySort} from '../../../features/commerce/sort/sort-actions';
import {sortReducer as commerceSort} from '../../../features/commerce/sort/sort-slice';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import { ReducersMapObject } from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../features/commerce/product-listing/product-listing-actions';
import {executeSearch} from '../../../features/commerce/search/search-actions';

export type {SortByRelevance, SortByFields, SortByFieldsFields, SortCriterion};
export {
  SortBy,
  SortDirection,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
};

export interface CoreSortProps {
  /**
   * The initial state that should be applied to this `Sort` controller.
   */
  initialState?: CoreSortInitialState;
}

export interface CoreSortInitialState {
  /**
   * The initial sort criterion to register in state.
   */
  criterion?: SortCriterion;
}

function validateSortInitialState(
  engine: CommerceEngine,
  state: CoreSortInitialState | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<CoreSortInitialState>({
    criterion: sortCriterionDefinition,
  });

  validateInitialState(engine, schema, state, 'buildSort');
}

export interface CoreSort extends Controller {
  /**
   * Updates the sort criterion.
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
  state: CoreSortState;
}

export interface CoreSortState {
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
 * Creates a `CoreSort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @param reducers - The reducers to apply on the `Sort` controller state.
 * @returns A `Sort` controller instance.
 */
export function buildCoreSort(engine: CommerceEngine, props: CoreSortProps = {}, reducers: ReducersMapObject): CoreSort {
  if (!loadSortReducers(engine, reducers)) {
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

export function loadSortReducers(engine: CommerceEngine, reducers: ReducersMapObject): engine is CommerceEngine {
  engine.addReducers({commerceSort, ...reducers});
  return true;
}
