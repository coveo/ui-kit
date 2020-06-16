import {Schema, SchemaValues, NumberValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {Component} from '../component/headless-component';
import {
  updatePage,
  registerPage,
} from '../../features/pagination/pagination-actions';
import {
  currentPageSelector,
  currentPagesSelector,
} from '../../features/pagination/pagination-selectors';
import {executeSearch} from '../../features/search/search-actions';

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

export class Pager extends Component {
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
    this.dispatch(executeSearch());
  }

  /** Returns `true` when the current page is equal to the current page, and `false` otherwise.
   * @param page The page number to check.
   * @returns boolean
   */
  public isCurrentPage(page: number) {
    return page === this.state.currentPage;
  }

  /**
   * @returns The state of the `Pager` component.
   */
  public get state() {
    return {
      currentPage: this.currentPage,
      currentPages: this.currentPages,
    };
  }

  private get currentPages() {
    const {numberOfPages} = this.options;
    return currentPagesSelector(this.engine.state, numberOfPages);
  }

  private get currentPage() {
    return currentPageSelector(this.engine.state);
  }
}
