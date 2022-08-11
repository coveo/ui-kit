import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {
  buildInsightPager,
  buildInsightSearchStatus,
  InsightPager,
  InsightPagerState,
  InsightSearchStatus,
  InsightSearchStatusState,
} from '../';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Hidden} from '../../common/hidden';
import {PagerCommon} from '../../common/pager/pager-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * The `atomic-insight-pager` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
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
  private pagerCommon!: PagerCommon;
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

  @FocusTarget()
  private activePage!: FocusTargetController;

  public initialize() {
    this.pagerCommon = new PagerCommon({
      bindings: this.bindings,
      initializeSearchStatus: () =>
        (this.searchStatus = buildInsightSearchStatus(this.bindings.engine)),
      initializePager: () =>
        (this.pager = buildInsightPager(this.bindings.engine, {
          options: {numberOfPages: this.numberOfPages},
        })),
      getEventEmitter: () => this.scrollToTopEvent,
      getActivePage: () => this.activePage,
    });
  }

  public render() {
    if (!this.pagerCommon) {
      return <Hidden></Hidden>;
    }

    return this.pagerCommon.render();
  }
}
