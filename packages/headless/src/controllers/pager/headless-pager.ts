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
import {
  ConfigurationSection,
  PaginationSection,
} from '../../state/state-sections';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';

export interface PagerProps {
  options?: PagerOptions;
  initialState?: PagerInitialState;
}

const optionsSchema = new Schema({
  /** The number of pages to display in the pager. */
  numberOfPages: new NumberValue({default: 5, min: 0}),
});

const initialStateSchema = new Schema({
  /** The initial page number */
  page: new NumberValue({min: 1}),
});

export type PagerOptions = SchemaValues<typeof optionsSchema>;
export type PagerInitialState = SchemaValues<typeof initialStateSchema>;

/**
 * The `Pager` controller allows to navigate through the different result pages.
 */
export type Pager = ReturnType<typeof buildPager>;

export type PagerState = Pager['state'];

export function buildPager(
  engine: Engine<PaginationSection & ConfigurationSection>,
  props: PagerProps = {}
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    optionsSchema,
    props.options,
    buildPager.name
  ) as Required<PagerOptions>;
  const initialState = validateInitialState(
    initialStateSchema,
    props.initialState,
    buildPager.name
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

    /** @returns The state of the `Pager` controller. */
    get state() {
      const currentPage = getCurrentPage();
      const maxPage = getMaxPage();
      const hasPreviousPage = currentPage > minimumPage && maxPage > 0;
      const hasNextPage = currentPage < maxPage;

      return {
        /** @returns the current selected page */
        currentPage,

        /** @returns the current pages range */
        currentPages: getCurrentPages(),

        /**  @returns the max available page for this query */
        maxPage,

        /** @returns `true` when a previous page is available, and `false` otherwise.*/
        hasPreviousPage,

        /** @returns `true` when a next page is available, and `false` otherwise. */
        hasNextPage,
      };
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
}
