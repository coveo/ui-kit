import {SearchStatus, SearchStatusState} from '@coveo/headless';
import {
  buildController,
  buildPager,
  Pager,
  PagerState,
  ProductListingEngine,
} from '@coveo/headless/product-listing';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
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
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';

/**
 * The `atomic-product-listing-pager` provides buttons that allow the end user to navigate through the different result pages.
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
  tag: 'atomic-product-listing-pager',
  styleUrl: 'atomic-product-listing-pager.pcss',
  shadow: true,
})
export class AtomicProductListingPager
  implements InitializableComponent<ProductListingBindings>
{
  @InitializeBindings() public bindings!: ProductListingBindings;
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

  /**
   * The SVG icon to use to display the Previous button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) previousButtonIcon = ArrowLeftIcon;

  /**
   * The SVG icon to use to display the Next button.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) nextButtonIcon = ArrowRightIcon;

  @FocusTarget()
  private activePage!: FocusTargetController;

  public initialize() {
    this.searchStatus = this.buildSearchStatus(this.bindings.engine);
    this.pager = buildPager(this.bindings.engine, {
      options: {numberOfPages: this.numberOfPages},
    });
  }

  private buildSearchStatus(engine: ProductListingEngine): SearchStatus {
    const controller = buildController(engine);
    const getState = () => engine.state;

    return {
      ...controller,

      get state() {
        const state = getState();

        return {
          hasError: state.productListing.error !== null,
          isLoading: state.productListing.isLoading,
          hasResults: !!state.productListing.products.length,
          firstSearchExecuted: state.productListing.responseId !== '',
        };
      },
    };
  }
  public render() {
    return (
      <PagerCommon
        activePage={this.activePage}
        bindings={this.bindings}
        eventEmitter={this.scrollToTopEvent}
        pager={this.pager}
        previousButtonIcon={this.previousButtonIcon}
        nextButtonIcon={this.nextButtonIcon}
        pagerState={this.pagerState}
        searchStatusState={this.searchStatusState}
      />
    );
  }
}
