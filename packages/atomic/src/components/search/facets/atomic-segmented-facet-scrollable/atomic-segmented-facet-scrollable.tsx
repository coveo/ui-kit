import {Component, h, Listen, State} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../../common/button';
import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Hidden} from '../../../common/hidden';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Bindings} from '../../../..';

type ArrowDirection = 'right' | 'left';

/**
 * @internal
 * The 'atomic-segmented-facet-scrollable' component wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities.
 *
 * @slot default - One or multiple atomic-segmented-facet components
 *
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-icon - The arrow icon on the left.
 * @part right-arrow-icon - The arrow icon on the right.
 * @part left-arrow-button - The arrow button used to scroll on the left.
 * @part right-arrow-button - The arrow button used to scroll on the left.
 * @part left-fade - The white to transparent gradient on the left.
 * @part right-fade - The white to transparent gradient on the right.
 */

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable implements InitializableComponent {
  @InitializeBindings()
  public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State()
  public error!: Error;

  private horizontalScroll?: HTMLDivElement;
  private arrowRef?: HTMLElement;
  @State() private hideLeftArrow = true;
  @State() private hideRightArrow = true;
  private observer!: ResizeObserver;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  public componentDidLoad() {
    this.observer = new ResizeObserver(() => {
      this.handleScroll();
    });
    this.observer.observe(this.horizontalScroll!);
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  @Listen('wheel')
  @Listen('touchmove')
  @Listen('keydown')
  public handleScroll() {
    if (!this.horizontalScroll) {
      return;
    }

    const isScrollable =
      this.horizontalScroll.clientWidth < this.horizontalScroll.scrollWidth;
    const isLeftEdge = Math.floor(this.horizontalScroll.scrollLeft) <= 0;
    const isRightEdge =
      Math.ceil(this.horizontalScroll.scrollLeft) >=
      this.horizontalScroll.scrollWidth - this.horizontalScroll.clientWidth;

    this.hideLeftArrow = !isScrollable || isLeftEdge;
    this.hideRightArrow = !isScrollable || isRightEdge;
  }

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScroll;
    const arrowWidth = this.arrowRef ? this.arrowRef.clientWidth : 50;
    if (!container) {
      return;
    }

    const pixelsToScroll = (container.clientWidth - arrowWidth * 2) * 0.7;
    const isLeftEdge = container.scrollLeft - pixelsToScroll <= 0;
    const isRightEdge =
      container.scrollLeft + pixelsToScroll >=
      container.scrollWidth - container.clientWidth;

    this.hideLeftArrow = false;
    this.hideRightArrow = false;

    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
      this.hideLeftArrow = isLeftEdge;
      return;
    }

    container.scrollLeft += pixelsToScroll;
    this.hideRightArrow = isRightEdge;
  }

  private getArrowClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return `left-0 ${this.hideLeftArrow ? 'invisible opacity-0' : ''}`;
    }

    return `right-0 ${this.hideRightArrow ? 'invisible opacity-0' : ''}`;
  }

  private getFadeClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return `bg-gradient-to-r left-0 ${this.hideLeftArrow ? 'opacity-0' : ''}`;
    }

    return `bg-gradient-to-l right-0 ${this.hideRightArrow ? 'opacity-0' : ''}`;
  }

  private renderArrow(direction: ArrowDirection) {
    if (!this.searchStatusState.firstSearchExecuted) {
      return;
    }

    return [
      <Button
        part={`${direction}-arrow-button`}
        style="square-neutral"
        class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-1 h-10 w-10 top-0 bottom-0 transition-visi-opacity ease-in-out duration-300 ${this.getArrowClass(
          direction
        )}`}
        ariaHidden="true"
        tabIndex="-1"
        onClick={() => this.slideHorizontally(direction)}
        ref={(el) => (this.arrowRef = el)}
      >
        <atomic-icon
          part={`${direction}-arrow-icon`}
          class="w-3.5"
          icon={direction === 'left' ? ArrowLeftIcon : ArrowRightIcon}
        ></atomic-icon>
      </Button>,
      <div
        part={`${direction}-fade`}
        class={`w-20 h-10 absolute top-0 z-0 pointer-events-none from-background-60 transition-visi-opacity ease-in-out duration-300 ${this.getFadeClass(
          direction
        )}`}
      ></div>,
    ];
  }

  public render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    return (
      <div part="scrollable-container" class="flex relative">
        {this.renderArrow('left')}
        <div
          part="horizontal-scroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}
