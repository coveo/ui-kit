import {Schema, NumberValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {buildController, Controller} from '../controller/headless-controller';
import {
  updatePage,
  registerPage,
  nextPage,
  previousPage,
} from '../../features/pagination/pagination-actions';
import {
  currentPageSelector,
  currentPagesSelector,
  maxPageSelector,
} from '../../features/pagination/pagination-selectors';
import {executeSearch} from '../../features/search/search-actions';
import {minimumPage} from '../../features/pagination/pagination-slice';
import {
  logPageNumber,
  logPageNext,
  logPagePrevious,
} from '../../features/pagination/pagination-analytics-actions';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../state/state-sections';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';

export interface PagerInitialState {
  /** The initial page number */
  page?: number;
}

export interface PagerOptions {
  /** The number of pages to display in the pager. */
  numberOfPages?: number;
}

export interface PagerProps {
  /**
   * The options for the `Pager` controller.
   */
  options?: PagerOptions;
  /**
   * The initial state that should be applied to the `Pager` controller.
   */
  initialState?: PagerInitialState;
}

const optionsSchema = new Schema({
  numberOfPages: new NumberValue({default: 5, min: 0}),
});

const initialStateSchema = new Schema({
  page: new NumberValue({min: 1}),
});

export interface Pager extends Controller {
  /**
   * Updates the results to those on the passed page.
   * @param page The page number.
   */
  selectPage(page: number): void;

  /** Updates the results to those on the next page.*/
  nextPage(): void;

  /** Updates the results to those on the previous page.*/
  previousPage(): void;

  /**
   * @returns `true` when the current page is equal to the current page, and `false` otherwise.
   * @param page The page number to check.
   * @returns boolean.
   */
  isCurrentPage(page: number): boolean;

  /** The state of the Pager controller */
  state: PagerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Pager` controller.
 */
export interface PagerState {
  /** @returns the current selected page */
  currentPage: number;

  /** @returns the current pages range */
  currentPages: number[];

  /**  @returns the max available page for this query */
  maxPage: number;

  /** @returns `true` when a previous page is available, and `false` otherwise.*/
  hasPreviousPage: boolean;

  /** @returns `true` when a next page is available, and `false` otherwise. */
  hasNextPage: boolean;
}

/**
 * The `Pager` controller allows to navigate through the different result pages.
 */
export function buildPager(
  engine: Engine<PaginationSection & ConfigurationSection>,
  props: PagerProps = {}
): Pager {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildPager'
  ) as Required<PagerOptions>;
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildPager'
  );
  const page = initialState.page;

  if (page) {
    dispatch(registerPage(page));
  }

  const getCurrentPage = () => {
    return currentPageSelector(engine.state);
  };

  const getCurrentPages = () => {
    const {numberOfPages} = options;
    return currentPagesSelector(engine.state, numberOfPages);
  };

  const getMaxPage = () => {
    return maxPageSelector(engine.state);
  };

  return {
    ...controller,

    get state() {
      const currentPage = getCurrentPage();
      const maxPage = getMaxPage();
      const hasPreviousPage = currentPage > minimumPage && maxPage > 0;
      const hasNextPage = currentPage < maxPage;

      return {
        currentPage,
        currentPages: getCurrentPages(),
        maxPage,
        hasPreviousPage,
        hasNextPage,
      };
    },

    selectPage(page: number) {
      dispatch(updatePage(page));
      dispatch(executeSearch(logPageNumber()));
    },

    nextPage() {
      dispatch(nextPage());
      dispatch(executeSearch(logPageNext()));
    },

    previousPage() {
      dispatch(previousPage());
      dispatch(executeSearch(logPagePrevious()));
    },

    isCurrentPage(page: number) {
      return page === this.state.currentPage;
    },
  };
}
