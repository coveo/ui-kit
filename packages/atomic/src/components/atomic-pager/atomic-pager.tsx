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
import {
  FocusTarget,
  FocusTargetController,
} from '../../utils/accessibility-utils';
import {randomID} from '../../utils/utils';
import {RadioButton} from '../common/radio-button';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.pcss',
  shadow: true,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private pager!: Pager;
  public searchStatus!: SearchStatus;
  private readonly radioGroupName = randomID('atomic-pager-');

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
  @Prop({reflect: true}) numberOfPages = 5;

  @FocusTarget()
  private activePage!: FocusTargetController;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private scrollToTop() {
    this.scrollToTopEvent.emit();
  }

  private selectPage(page: number) {
    this.pager.selectPage(page);
    this.activePage.focusAfterSearch().then(() => this.scrollToTop());
  }

  private get previousButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('previous')}
        onClick={() => {
          this.pager.previousPage();
          this.scrollToTop();
        }}
        part="previous-button"
        disabled={!this.pagerState.hasPreviousPage}
      >
        <atomic-icon icon={ArrowRight} class="w-5 rotate-180"></atomic-icon>
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
          this.scrollToTop();
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
    return (
      <div
        part="page-buttons"
        role="radiogroup"
        class="h-10 flex space-x-2 flex-wrap"
      >
        {pages.map((page) => this.buildPage(page))}
      </div>
    );
  }

  private buildPage(page: number) {
    const isSelected = this.pager.isCurrentPage(page);
    const parts = ['page-button'];
    if (isSelected) {
      parts.push('active-page-button');
    }
    return (
      <RadioButton
        key={page}
        groupName={this.radioGroupName}
        style="outline-neutral"
        checked={isSelected}
        ariaCurrent={isSelected ? 'page' : 'false'}
        ariaLabel={this.bindings.i18n.t('page-number', {page})}
        onChecked={() => this.selectPage(page)}
        class="btn-page"
        part={parts.join(' ')}
        text={page.toLocaleString(this.bindings.i18n.language)}
        ref={isSelected ? this.activePage.setTarget : undefined}
      ></RadioButton>
    );
  }

  public render() {
    if (!this.searchStatusState.hasResults) {
      return;
    }

    return (
      <nav aria-label={this.bindings.i18n.t('pagination')}>
        <div part="buttons" class="h-10 flex space-x-2 flex-wrap">
          {this.previousButton}
          {this.pages}
          {this.nextButton}
        </div>
      </nav>
    );
  }
}
