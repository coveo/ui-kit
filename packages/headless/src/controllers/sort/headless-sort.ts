import {Engine} from '../../app/headless-engine';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../features/sort-criteria/sort-criteria-actions';
import {executeSearch} from '../../features/search/search-actions';
import {SortCriterion} from '../../features/sort-criteria/criteria';
import {buildController} from '../controller/headless-controller';
import {updatePage} from '../../features/pagination/pagination-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';

export interface SortProps {
  initialState: Partial<SortInitialState>;
}

export interface SortInitialState {
  /** The initial sort criterion to register in state. */
  criterion: SortCriterion;
}

/** The `Sort` controller allows to changing how the results are sorted.*/
export type Sort = ReturnType<typeof buildSort>;

/** The state relevant to the `Sort` controller.*/
export type SortState = Sort['state'];

export function buildSort(engine: Engine, props: Partial<SortProps> = {}) {
  const controller = buildController(engine);
  const {dispatch} = engine;
  const criterion = props.initialState?.criterion;
  const search = () => dispatch(executeSearch(logResultsSort()));

  if (criterion) {
    dispatch(registerSortCriterion(criterion));
  }

  return {
    ...controller,

    /**
     * Updates the sort criterion and executes a new search.
     * @param criterion The new sort criterion.
     */
    sortBy(criterion: SortCriterion) {
      dispatch(updateSortCriterion(criterion));
      dispatch(updatePage(1));
      search();
    },

    /**
     * Returns `true` if the passed sort criterion matches the value in state, and `false` otherwise.
     * @param criterion The criterion to compare.
     * @returns {boolean}
     */
    isSortedBy(criterion: SortCriterion) {
      return this.state.sortCriteria === criterion.expression;
    },

    /**  @returns The state of the `Sort` controller.*/
    get state() {
      return {
        sortCriteria: engine.state.sortCriteria,
      };
    },
  };
}
