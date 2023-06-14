import {
  buildController,
  buildPager,
  Pager,
  PagerState,
  ProductListingEngine,
} from '@coveo/headless/product-listing';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {ProductListingSearchStatus, ProductListingSearchStatusState} from '../';
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
 * @internal
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
  public searchStatus!: ProductListingSearchStatus;

  @BindStateToController('pager')
  @State()
  public pagerState!: PagerState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: ProductListingSearchStatusState;
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

  private buildSearchStatus(
    engine: ProductListingEngine
  ): ProductListingSearchStatus {
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
