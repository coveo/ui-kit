import {Engine} from '../../app/headless-engine';
import {Component} from '../component/headless-component';
import {updatePage} from '../../features/pagination/pagination-actions';
import {pageSelector} from '../../features/pagination/pagination-selectors';
import {executeSearch} from '../../features/search/search-actions';

export type PagerState = Pager['state'];

export class Pager extends Component {
  constructor(engine: Engine) {
    super(engine);
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
      availablePages: this.availablePages,
    };
  }

  private get availablePages() {
    return [1, 2, 3];
  }

  private get currentPage() {
    return pageSelector(this.engine.state);
  }
}
