import {Schema, SchemaValues, NumberValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';
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
} from '../../features/analytics/analytics-actions';

export type PagerState = Pager['state'];

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

export class Pager extends Controller {
  private options!: Required<PagerOptions>;

  constructor(engine: Engine, props: PagerProps = {}) {
    super(engine);

    this.initOptions(props.options);
    this.register(props.initialState);
  }

  private initOptions(options: PagerOptions | undefined) {
    this.options = optionsSchema.validate(options) as Required<PagerOptions>;
  }

  private register(initialState: PagerInitialState | undefined) {
    const page = initialState?.page;

    if (page) {
      this.dispatch(registerPage(page));
    }
  }

  /**
   * Updates the results to those on the passed page.
   * @param page The page number.
   */
  public selectPage(page: number) {
    this.dispatch(updatePage(page));
    this.dispatch(executeSearch(logPageNumber()));
  }

  /**
   * Updates the results to those on the next page.
   */
  public nextPage() {
    this.dispatch(nextPage());
    this.dispatch(executeSearch(logPageNext()));
  }

  /**
   * Updates the results to those on the previous page.
   */
  public previousPage() {
    this.dispatch(previousPage());
    this.dispatch(executeSearch(logPagePrevious()));
  }

  /**
   * Returns `true` when a next page is available, and `false` otherwise.
   */
  public get hasNextPage() {
    const {currentPage, maxPage} = this.state;
    return currentPage < maxPage;
  }

  /**
   * Returns `true` when a previous page is available, and `false` otherwise.
   */
  public get hasPreviousPage() {
    const {currentPage, maxPage} = this.state;
    return currentPage > minimumPage && maxPage > 0;
  }

  /** Returns `true` when the current page is equal to the current page, and `false` otherwise.
   * @param page The page number to check.
   * @returns boolean.
   */
  public isCurrentPage(page: number) {
    return page === this.state.currentPage;
  }

  /**
   * @returns The state of the `Pager` controller.
   */
  public get state() {
    return {
      currentPage: this.currentPage,
      currentPages: this.currentPages,
      maxPage: this.maxPage,
    };
  }

  private get currentPages() {
    const {numberOfPages} = this.options;
    return currentPagesSelector(this.engine.state, numberOfPages);
  }

  private get currentPage() {
    return currentPageSelector(this.engine.state);
  }

  private get maxPage() {
    return maxPageSelector(this.engine.state);
  }
}
