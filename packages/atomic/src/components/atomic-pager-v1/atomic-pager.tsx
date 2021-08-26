import {Component, h, Prop, State, Event, EventEmitter} from '@stencil/core';
import {
  Pager,
  PagerState,
  buildPager,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import ArrowRight from '../../images/arrow-right.svg';
import {Button} from '../common/button';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of buttons.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
 */
@Component({
  tag: 'atomic-pager-v1', // TODO: remove v1
  styleUrl: 'atomic-pager.pcss',
  shadow: true,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private pager!: Pager;
  public searchStatus!: SearchStatus;

  @BindStateToController('pager')
  @State()
  private pagerState!: PagerState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() error!: Error;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop() numberOfPages = 5;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private scrollToTop() {
    this.scrollToTopEvent.emit();
  }

  private get previousButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('previous')}
        onClick={() => {
          this.pager.previousPage();
        }}
        part="previous-button"
        disabled={!this.pagerState.hasPreviousPage}
      >
        <atomic-icon
          icon={ArrowRight}
          class="w-5 transform rotate-180"
        ></atomic-icon>
      </Button>
    );
  }

  private get nextButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('next')}
        onClick={() => {
          this.pager.nextPage();
        }}
        part="next-button"
        disabled={!this.pagerState.hasNextPage}
      >
        <atomic-icon icon={ArrowRight} class="w-5"></atomic-icon>
      </Button>
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
        <Button
          ariaCurrent={isSelected ? 'page' : 'false'}
          style="outline-neutral"
          ariaLabel={this.bindings.i18n.t('page-number', {page})}
          onClick={() => {
            this.pager.selectPage(page);
            this.scrollToTop();
          }}
          class={`btn-page ${isSelected ? 'selected' : ''}`}
          part={`page-button ${isSelected && 'active-page-button'}`}
          text={page.toLocaleString(this.bindings.i18n.language)}
        ></Button>
      </li>
    );
  }

  public render() {
    if (!this.searchStatusState.hasResults) {
      return;
    }

    return (
      <nav aria-label={this.bindings.i18n.t('pagination')}>
        <ul part="buttons" class="h-10 flex space-x-2 flex-wrap">
          {this.previousButton}
          {this.pages}
          {this.nextButton}
        </ul>
      </nav>
    );
  }
}
