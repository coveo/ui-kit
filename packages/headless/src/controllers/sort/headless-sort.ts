import {Engine} from '../../app/headless-engine';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../features/sort-criteria/sort-criteria-actions';
import {executeSearch} from '../../features/search/search-actions';
import {SortCriterion} from '../../features/sort-criteria/criteria';
import {Controller} from '../controller/headless-controller';
import {updatePage} from '../../features/pagination/pagination-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';

export interface SortProps {
  initialState: Partial<SortInitialState>;
}

export interface SortInitialState {
  /** The initial sort criterion to register in state. */
  criterion: SortCriterion;
}

/** The state relevant to the `Sort` controller.*/
export type SortState = Sort['state'];

export class Sort extends Controller {
  constructor(engine: Engine, private props: Partial<SortProps> = {}) {
    super(engine);
    this.register();
  }

  /**
   * Updates the sort criterion and executes a new search.
   * @param criterion The new sort criterion.
   */
  public sortBy(criterion: SortCriterion) {
    this.dispatch(updateSortCriterion(criterion));
    this.dispatch(updatePage(1));
    this.search();
  }

  /**
   * Returns `true` if the passed sort criterion matches the value in state, and `false` otherwise.
   * @param criterion The criterion to compare.
   * @returns {boolean}
   */
  public isSortedBy(criterion: SortCriterion) {
    return this.engine.state.sortCriteria === criterion.expression;
  }

  /**
   * @returns The state of the `Sort` controller.
   */
  public get state() {
    return {
      sortCriteria: this.engine.state.sortCriteria,
    };
  }

  private register() {
    const criterion = this.props.initialState?.criterion;

    if (criterion) {
      this.dispatch(registerSortCriterion(criterion));
    }
  }

  private search() {
    this.dispatch(executeSearch(logResultsSort()));
  }
}
