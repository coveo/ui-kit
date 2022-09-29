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
import {PagerCommon} from '../../common/pager/pager-common';
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

  @FocusTarget<InsightBindings>()
  private activePage!: FocusTargetController;

  public initialize() {
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.pager = buildInsightPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  public render() {
    return (
      <PagerCommon
        bindings={this.bindings}
        eventEmitter={this.scrollToTopEvent}
        activePage={this.activePage}
        pager={this.pager}
        pagerState={this.pagerState}
        searchStatusState={this.searchStatusState}
      />
    );
  }
}
