import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {updatePage} from '../../../features/pagination/pagination-actions';
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
import {CoreEngine} from '../../../app/engine';
import {
  ConfigurationSection,
  StructuredSortSection,
} from '../../../state/state-sections';
import {configuration, sort} from '../../../app/reducers';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {loadReducerError} from '../../../utils/errors';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort/sort-actions';
import {Schema} from '@coveo/bueno';
import {validateInitialState} from '../../../utils/validate-payload';

export {
  SortBy,
  SortDirection,
  SortByRelevance,
  SortByFields,
  SortByFieldsFields,
  SortCriterion,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
};

export interface ProductListingSortProps {
  /**
   * The initial state that should be applied to this `Sort` controller.
   */
  initialState?: ProductListingSortInitialState;
}

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

export interface ProductListingSort extends Controller {
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
   * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
   */
  state: ProductListingSortState;
}

export interface ProductListingSortState {
  /**
   * The current sort criterion.
   */
  sort: SortCriterion;
}

/**
 * Creates a `Sort` controller instance for the product listing.
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
