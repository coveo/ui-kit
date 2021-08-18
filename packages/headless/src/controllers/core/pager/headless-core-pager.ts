import {NumberValue, Schema} from '@coveo/bueno';
import {CoreEngine} from '../../../app/engine';
import {configuration, pagination} from '../../../app/reducers';
import {
  nextPage,
  previousPage,
  registerPage,
  updatePage,
} from '../../../features/pagination/pagination-actions';
import {
  currentPageSelector,
  currentPagesSelector,
  maxPageSelector,
} from '../../../features/pagination/pagination-selectors';
import {minimumPage} from '../../../features/pagination/pagination-slice';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  validateInitialState,
  validateOptions,
} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface PagerInitialState {
  /**
   * The initial page number.
   * */
  page?: number;
}

export interface PagerOptions {
  /**
   * The number of pages to display in the pager.
   *
   * @defaultValue `5`
   * */
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

/**
 * The `Pager` controller allows to navigate through the different result pages.
 */
export interface Pager extends Controller {
  /**
   * Updates the results to those on the passed page.
   *
   * @param page - The page number.
   */
  selectPage(page: number): void;

  /**
   * Updates the results to those on the next page.
   * */
  nextPage(): void;

  /**
   * Updates the results to those on the previous page.
   * */
  previousPage(): void;

  /**
   * Returns `true` when the current page is equal to the passed page, and `false` otherwise.
   *
   * @param page - The page number to check.
   * @returns Whether the passed page is selected.
   */
  isCurrentPage(page: number): boolean;

  /**
   * The state of the Pager controller.
   * */
  state: PagerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Pager` controller.
 */
export interface PagerState {
  /**
   * The active page number.
   * */
  currentPage: number;

  /**
   * The page range to display.
   * */
  currentPages: number[];

  /**
   * The maximum available page.
   * */
  maxPage: number;

  /**
   * Returns `true` when a previous page is available, and `false` otherwise.
   * */
  hasPreviousPage: boolean;

  /**
   * Returns `true` when a next page is available, and `false` otherwise.
   * */
  hasNextPage: boolean;
}

export function buildCorePager(
  engine: CoreEngine,
  props: PagerProps = {}
): Pager {
  if (!loadPagerReducers(engine)) {
    throw loadReducerError;
  }

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
    },

    nextPage() {
      dispatch(nextPage());
    },

    previousPage() {
      dispatch(previousPage());
    },

    isCurrentPage(page: number) {
      return page === this.state.currentPage;
    },
  };
}

function loadPagerReducers(
  engine: CoreEngine
): engine is CoreEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({configuration, pagination});
  return true;
}
