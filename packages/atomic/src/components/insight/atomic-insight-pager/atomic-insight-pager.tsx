import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {
  buildInsightPager,
  buildInsightSearchStatus,
  InsightPager,
  InsightPagerState,
  InsightSearchStatus,
  InsightSearchStatusState,
} from '../';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {
  PagerNextButton,
  PagerPageButton,
  PagerPageButtons,
  PagerPreviousButton,
} from '../../common/pager/pager-buttons';
import {PagerNavigation} from '../../common/pager/pager-navigation';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-pager',
  styleUrl: 'atomic-insight-pager.pcss',
  shadow: true,
})
export class AtomicInsightPager
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public pager!: InsightPager;
  public searchStatus!: InsightSearchStatus;

  @BindStateToController('pager')
  @State()
  public pagerState!: InsightPagerState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: InsightSearchStatusState;
  @State() error!: Error;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  /**
   * Specifies how many page buttons to display in the pager.
   */
  @Prop({reflect: true}) numberOfPages = 5;

  private activePage?: FocusTargetController;
  private radioGroupName = randomID('atomic-insight-pager-');

  public initialize() {
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.pager = buildInsightPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private get focusTarget(): FocusTargetController {
    if (!this.activePage) {
      this.activePage = new FocusTargetController(this);
    }

    return this.activePage;
  }

  private async focusOnFirstResultAndScrollToTop() {
    await this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    this.scrollToTopEvent.emit();
  }

  public render() {
    return (
      <PagerNavigation i18n={this.bindings.i18n}>
        <PagerPreviousButton
          icon={ArrowLeftIcon}
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
          icon={ArrowRightIcon}
          disabled={!this.pagerState.hasNextPage}
          i18n={this.bindings.i18n}
          onClick={() => {
            this.pager.nextPage();
            this.focusOnFirstResultAndScrollToTop();
          }}
        />
      </PagerNavigation>
    );
  }
}
