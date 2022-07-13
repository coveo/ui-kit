import {Component, h, Listen, State} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../../components/common/button';
import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Hidden} from '../../../components/common/hidden';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../src/utils/initialization-utils';
import {Bindings} from '../../..';

type ArrowDirection = 'right' | 'left';

/**
 * @internal
 * The 'atomic-segmented-facet-scrollable' component wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities.
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-box - The left arrow box containing both the left arrow button and the fade.
 * @part right-arrow-box - The right arrow box containing both the right arrow button and the fade.
 * @part arrow-button - The arrow button used to scroll left or right.
 * @part fade - The white to transparent gradient.
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
  @State() private hideLeftArrow = true;
  @State() private hideRightArrow = false;
  private observer!: ResizeObserver;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  componentDidLoad() {
    this.observer = new ResizeObserver(() => {
      this.handleScroll();
    });
    this.observer.observe(this.horizontalScroll as HTMLDivElement);
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  @Listen('wheel')
  @Listen('touchmove')
  handleScroll() {
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
    if (!container) {
      return;
    }

    const pixelsToScroll = container.clientWidth * 0.75;
    const isLeftEdge = container.scrollLeft - pixelsToScroll <= 0;
    const isRightEdge =
      container.scrollLeft + pixelsToScroll >=
      container.scrollWidth - container.clientWidth;

    this.hideLeftArrow = false;
    this.hideRightArrow = false;

    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
      this.hideLeftArrow = isLeftEdge;
    } else {
      container.scrollLeft += pixelsToScroll;
      this.hideRightArrow = isRightEdge;
    }
  }

  private renderArrowClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return 'left-0 ' + (this.hideLeftArrow ? 'invisible opacity-0' : '');
    } else {
      return 'right-0 ' + (this.hideRightArrow ? 'invisible opacity-0' : '');
    }
  }

  private renderFadeClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return (
        'bg-gradient-to-r left-0 ' + (this.hideLeftArrow ? 'opacity-0' : '')
      );
    } else {
      return (
        'bg-gradient-to-l right-0 ' + (this.hideRightArrow ? 'opacity-0' : '')
      );
    }
  }

  private renderArrow(direction: ArrowDirection) {
    const isLeft = direction === 'left';
    return [
      <Button
        part={`${direction}-arrow-button`}
        style="square-neutral"
        class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-[2] h-10 w-10 top-0 bottom-0 transition-visi-opacity ease-in-out duration-300 ${this.renderArrowClass(
          direction
        )}`}
        ariaHidden="true"
        tabIndex="-1"
        onClick={() => this.slideHorizontally(direction)}
      >
        <atomic-icon
          part={`${direction}-arrow-icon`}
          class="w-3.5"
          icon={isLeft ? ArrowLeftIcon : ArrowRightIcon}
        ></atomic-icon>
      </Button>,
      <div
        part={`${direction}-fade`}
        class={`w-20 h-10 absolute top-0  z-[1] pointer-events-none from-background-60 transition-visi-opacity ease-in-out duration-300 ${this.renderFadeClass(
          direction
        )}`}
      ></div>,
    ];
  }

  render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    return (
      <div part="scrollable-container" class="flex relative">
        {this.renderArrow('left')}
        <div
          part="horizontal-scroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}
