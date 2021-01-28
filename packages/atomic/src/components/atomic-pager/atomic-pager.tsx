import {Component, h, Prop, State} from '@stencil/core';
import {Pager, PagerState, buildPager} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';

/**
 * The Pager provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part list - The list of buttons
 * @part back-button - The back button
 * @part next-button - The next button
 * @part page-button - The page button
 * @part active-page-button - The active page button
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.pcss',
  shadow: true,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private pager!: Pager;

  @BindStateToController('pager')
  @State()
  private pagerState!: PagerState;
  @BindStateToI18n()
  @State()
  private strings = {
    pagination: () => this.bindings.i18n.t('pagination'),
    previous: () => this.bindings.i18n.t('previous'),
    next: () => this.bindings.i18n.t('next'),
    pageNumber: (page: number) => this.bindings.i18n.t('pageNumber', {page}),
  };
  @State() error!: Error;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop() numberOfPages = 5;
  /**
   * Specifies whether the **Previous** and **Next** buttons should appear at each end of the pager when appropriate.
   */
  @Prop() enableNavigationButtons = true;

  public initialize() {
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private get backButton() {
    if (!this.pagerState.hasPreviousPage) {
      return null;
    }

    return (
      <li>
        <button
          part="back-button"
          aria-label={this.strings.previous()}
          onClick={() => {
            this.pager.previousPage();
          }}
        >
          <span innerHTML={ArrowLeftIcon}></span>
        </button>
      </li>
    );
  }

  private get nextButton() {
    if (!this.pagerState.hasNextPage) {
      return null;
    }

    return (
      <li>
        <button
          part="next-button"
          aria-label={this.strings.next()}
          onClick={() => {
            this.pager.nextPage();
          }}
        >
          <div innerHTML={ArrowRightIcon}></div>
        </button>
      </li>
    );
  }

  private get pages() {
    const pages = this.pager.state.currentPages;
    return pages.map((page) => this.buildPage(page));
  }

  private buildPage(page: number) {
    const isSelected = this.pager.isCurrentPage(page);

    return (
      <li>
        <button
          part={`page-button ${isSelected && 'active-page-button'}`}
          aria-label={this.strings.pageNumber(page)}
          onClick={() => {
            this.pager.selectPage(page);
          }}
        >
          {page}
        </button>
      </li>
    );
  }

  public render() {
    return (
      <nav aria-label={this.strings.pagination()}>
        <ul part="list">
          {this.enableNavigationButtons && this.backButton}
          {this.pages}
          {this.enableNavigationButtons && this.nextButton}
        </ul>
      </nav>
    );
  }
}
