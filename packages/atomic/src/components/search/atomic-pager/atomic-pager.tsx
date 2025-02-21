import {
  buildPager,
  buildSearchStatus,
  Pager,
  PagerState,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../utils/utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {
  PagerNextButton,
  PagerPageButton,
  PagerPageButtons,
  PagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {PagerGuard} from '../../common/pager/pager-guard';
import {PagerNavigation} from '../../common/pager/pager-navigation';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-pager` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part previous-button-icon - Icon of the previous button.
 * @part next-button-icon - Icon of the next button.
 */
@Component({
  tag: 'atomic-pager',
  styleUrl: 'atomic-pager.pcss',
  shadow: true,
})
export class AtomicPager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public pager!: Pager;
  public searchStatus!: SearchStatus;

  @BindStateToController('pager')
  @State()
  public pagerState!: PagerState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() error!: Error;
  @State() private isAppLoaded = false;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop({reflect: true}) numberOfPages = 5;

  /**
   * The SVG icon to use to display the Previous button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) previousButtonIcon: string = ArrowLeftIcon;

  /**
   * The SVG icon to use to display the Next button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) nextButtonIcon: string = ArrowRightIcon;

  private activePage?: FocusTargetController;
  private radioGroupName = randomID('atomic-pager-');

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public render() {
    return (
      <PagerGuard
        hasError={this.searchStatusState.hasError}
        hasItems={this.searchStatusState.hasResults}
        isAppLoaded={this.isAppLoaded}
      >
        <PagerNavigation i18n={this.bindings.i18n}>
          <PagerPreviousButton
            icon={this.previousButtonIcon}
            disabled={!this.pagerState.hasPreviousPage}
            i18n={this.bindings.i18n}
            onClick={() => {
              this.pager.previousPage();
              this.focusOnFirstResultAndScrollToTop();
            }}
          />
          <PagerPageButtons i18n={this.bindings.i18n}>
            {this.pagerState.currentPages.map((pageNumber) => {
              return (
                <PagerPageButton
                  isSelected={this.pager.isCurrentPage(pageNumber)}
                  ariaLabel={this.bindings.i18n.t('page-number', {pageNumber})}
                  onChecked={() => {
                    this.pager.selectPage(pageNumber);
                    this.focusOnFirstResultAndScrollToTop();
                  }}
                  page={pageNumber}
                  groupName={this.radioGroupName}
                  ref={(el) => {
                    const isSelected = this.pager.isCurrentPage(pageNumber);
                    if (isSelected && el) {
                      this.focusTarget.setTarget(el);
                    }
                  }}
                  text={pageNumber.toLocaleString(this.bindings.i18n.language)}
                />
              );
            })}
          </PagerPageButtons>
          <PagerNextButton
            icon={this.nextButtonIcon}
            disabled={!this.pagerState.hasNextPage}
            i18n={this.bindings.i18n}
            onClick={() => {
              this.pager.nextPage();
              this.focusOnFirstResultAndScrollToTop();
            }}
          />
        </PagerNavigation>
      </PagerGuard>
    );
  }

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.scrollToTopEvent.emit();
  }

  private get focusTarget() {
    if (!this.activePage) {
      this.activePage = new FocusTargetController(this);
    }
    return this.activePage;
  }
}
