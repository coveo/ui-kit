import {Schema, SchemaValues, NumberValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
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

export interface PagerProps {
  options?: PagerOptions;
  initialState?: PagerInitialState;
}

const optionsSchema = new Schema({
  /** The number of pages to display in the pager. */
  numberOfPages: new NumberValue({default: 5, min: 0}),
});

export type PagerOptions = SchemaValues<typeof optionsSchema>;

export type PagerInitialState = {
  /** The initial page number */
  page?: number;
};

/**
 * The `Pager` controller allows to navigate through the different result pages.
 */
export type Pager = ReturnType<typeof buildPager>;

export type PagerState = Pager['state'];

export const buildPager = (engine: Engine, props: PagerProps = {}) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = optionsSchema.validate(props.options) as Required<
    PagerOptions
  >;

  const page = props.initialState?.page;

  if (page) {
    dispatch(registerPage(page));
  }

  const currentPage = () => {
    return currentPageSelector(engine.state);
  };

  const currentPages = () => {
    const {numberOfPages} = options;
    return currentPagesSelector(engine.state, numberOfPages);
  };

  const maxPage = () => {
    return maxPageSelector(engine.state);
  };

  return {
    ...controller,

    /**
     * @returns The state of the `Pager` controller.
     */
    get state() {
      return {
        currentPage: currentPage(),
        currentPages: currentPages(),
        maxPage: maxPage(),
      };
    },

    /**
     * @returns the current pages range
     */
    get currentPages() {
      return currentPages();
    },

    /**
     * @returns the current selected page
     */
    get currentPage(): number {
      return currentPage();
    },

    /**
     * @returns the max available page for this query
     */
    get maxPage(): number {
      return maxPage();
    },

    /**
     * @returns `true` when a previous page is available, and `false` otherwise.
     */
    get hasPreviousPage(): boolean {
      const {currentPage, maxPage} = this.state;
      return currentPage > minimumPage && maxPage > 0;
    },

    /**
     * @returns `true` when a next page is available, and `false` otherwise.
     */
    get hasNextPage(): boolean {
      const {currentPage, maxPage} = this.state;
      return currentPage < maxPage;
    },

    /**
     * Updates the results to those on the passed page.
     * @param page The page number.
     */
    selectPage(page: number) {
      dispatch(updatePage(page));
      dispatch(executeSearch(logPageNumber()));
    },

    /**
     * Updates the results to those on the next page.
     */
    nextPage() {
      dispatch(nextPage());
      dispatch(executeSearch(logPageNext()));
    },

    /**
     * Updates the results to those on the previous page.
     */
    previousPage() {
      dispatch(previousPage());
      dispatch(executeSearch(logPagePrevious()));
    },

    /**
     * @returns `true` when the current page is equal to the current page, and `false` otherwise.
     * @param page The page number to check.
     * @returns boolean.
     */
    isCurrentPage(page: number) {
      return page === this.state.currentPage;
    },
  };
};
