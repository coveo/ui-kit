import {
  buildPager,
  buildSearchStatus,
  Pager,
  PagerState,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
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
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
  public pager!: Pager;
  public searchStatus!: SearchStatus;

  @BindStateToController('pager')
  @State()
  public pagerState!: PagerState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
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

  public render() {
    return (
      <PagerCommon
        activePage={this.activePage}
        bindings={this.bindings}
        eventEmitter={this.scrollToTopEvent}
        pager={this.pager}
        pagerState={this.pagerState}
        searchStatusState={this.searchStatusState}
      />
    );
  }
}
