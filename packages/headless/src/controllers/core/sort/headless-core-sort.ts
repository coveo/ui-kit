import {ArrayValue, isArray, Schema} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import {updatePage} from '../../../features/pagination/pagination-actions.js';
import {
  buildCriterionExpression,
  criterionDefinition,
  type SortCriterion,
} from '../../../features/sort-criteria/criteria.js';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort-criteria/sort-criteria-actions.js';
import {sortCriteriaReducer as sortCriteria} from '../../../features/sort-criteria/sort-criteria-slice.js';
import type {
  ConfigurationSection,
  SortSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateInitialState} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

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
  criterion?: SortCriterion | SortCriterion[];
}

function validateSortInitialState(
  engine: CoreEngine<ConfigurationSection & SortSection>,
  state: Partial<SortInitialState> | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<SortInitialState>({
    criterion: new ArrayValue({each: criterionDefinition}) as never,
  });
  const criterion = getCriterionAsArray(state);
  const initialState: SortInitialState = {...state, criterion};

  validateInitialState(engine, schema, initialState, 'buildSort');
}

function getCriterionAsArray(state: Partial<SortInitialState>) {
  if (!state.criterion) {
    return [];
  }

  return isArray(state.criterion) ? state.criterion : [state.criterion];
}

/**
 * The `Sort` controller manages how the results are sorted.
 *
 * Example: [sort.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/sort/sort.fn.tsx)
 *
 * @group Controllers
 * @category Sort
 */
export interface Sort extends Controller {
  /**
   * Updates the sort criterion and executes a new search.
   *
   * @param criterion - The new sort criterion.
   */
  sortBy(criterion: SortCriterion | SortCriterion[]): void;

  /**
   * Verifies whether the specified sort criterion is the currently active one.
   *
   * @param criterion - The sort criterion to evaluate.
   * Can be a single criterion or an array of criteria.
   * The criteria in an array will be applied sequentially. For example, if there's a tie on the 1st criterion, the API uses the 2nd criterion to break the tie. However, this only works when combining:
   * `SortByRelevancy` followed by one or more `SortByField` or `SortByDate` criteria.
   * `SortByQRE` followed by one or more `SortByField` or `SortByDate` criteria.
   * Two or more `SortByField` criteria.
   * A single `SortByDate` criterion and one or more `SortByField` criteria in any order.
   *
   * Examples:
   * * `SortByRelevancy`, `SortByField`
   * * `SortByQRE`, `SortByField`
   * * `SortByDate`, `SortByField`, `SortByField`
   *
   * @returns `true` if the specified sort criterion is the currently active one; `false` otherwise.
   */
  isSortedBy(criterion: SortCriterion | SortCriterion[]): boolean;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
   */
  state: SortState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Sort` controller.
 *
 * @group Controllers
 * @category Sort
 */
export interface SortState {
  /**
   * The current sort criteria.
   */
  sortCriteria: string;
}

/**
 * Creates a `Sort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildCoreSort(engine: CoreEngine, props: SortProps): Sort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;

  if (criterion) {
    dispatch(registerSortCriterion(criterion));
  }

  return {
    ...controller,

    sortBy(criterion: SortCriterion | SortCriterion[]) {
      dispatch(updateSortCriterion(criterion));
      dispatch(updatePage(1));
    },

    isSortedBy(criterion: SortCriterion | SortCriterion[]) {
      return this.state.sortCriteria === buildCriterionExpression(criterion);
    },

    get state() {
      return {
        sortCriteria: getState().sortCriteria,
      };
    },
  };
}

function loadSortReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & SortSection> {
  engine.addReducers({configuration, sortCriteria});
  return true;
}
