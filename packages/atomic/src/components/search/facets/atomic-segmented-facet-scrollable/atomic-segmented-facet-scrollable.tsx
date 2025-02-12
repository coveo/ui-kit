import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Element, h, Listen, State} from '@stencil/core';
import {Bindings} from '../../../..';
import ArrowLeftIcon from '../../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../../images/arrow-right-rounded.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/stencil-button';
import {Hidden} from '../../../common/stencil-hidden';

type ArrowDirection = 'right' | 'left';

/**
 * The 'atomic-segmented-facet-scrollable' component wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities.
 *
 * @slot default - One or multiple atomic-segmented-facet components
 *
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-wrapper - The wrapper for the arrow button & fade on the left.
 * @part right-arrow-wrapper - The wrapper for the arrow button & fade on the right.
 * @part left-arrow-button - The arrow button used to scroll on the left.
 * @part right-arrow-button - The arrow button used to scroll on the right.
 * @part left-arrow-icon - The arrow icon on the left.
 * @part right-arrow-icon - The arrow icon on the right.
 * @part left-fade - The white to transparent gradient on the left.
 * @part right-fade - The white to transparent gradient on the right.
 */
@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable implements InitializableComponent {
  @Element() private host!: HTMLElement;
  private horizontalScrollRef?: HTMLElement;
  private arrowRef?: HTMLElement;
  private observer!: ResizeObserver;

  @InitializeBindings()
  public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State()
  public error!: Error;
  @State() private hideLeftArrow = true;
  @State() private hideRightArrow = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  public componentDidLoad() {
    this.observer = new ResizeObserver(() => {
      this.handleScroll();
    });

    Array.from(this.host.children).forEach((el) => this.observer.observe(el));
    this.observer.observe(this.horizontalScrollRef!);
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  @Listen('wheel')
  @Listen('touchmove')
  @Listen('keydown')
  public handleScroll() {
    if (!this.horizontalScrollRef) {
      return;
    }
    const container = this.horizontalScrollRef;
    const isScrollable = container.clientWidth < container.scrollWidth;

    const isLeftEdge = Math.floor(container.scrollLeft) <= 0;
    const isRightEdge =
      Math.ceil(container.scrollLeft) >=
      container.scrollWidth - container.clientWidth;

    this.hideLeftArrow = !isScrollable || isLeftEdge;
    this.hideRightArrow = !isScrollable || isRightEdge;
  }

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScrollRef!;
    const arrowsWidth = this.arrowRef!.clientWidth * 2;

    const pixelsToScroll = (container.clientWidth - arrowsWidth) * 0.7;

    const isLeftEdge = Math.floor(container.scrollLeft - pixelsToScroll) <= 0;
    const isRightEdge =
      Math.ceil(container.scrollLeft + pixelsToScroll) >=
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

  private renderArrow(direction: ArrowDirection) {
    const hide =
      (direction === 'left' && this.hideLeftArrow) ||
      (direction === 'right' && this.hideRightArrow);
    const hiddenClass = hide ? 'invisible opacity-0' : '';
    const transitionClass = 'transition-visi-opacity ease-in-out duration-300';

    return (
      <div
        part={`${direction}-arrow-wrapper`}
        class={`${hiddenClass} ${transitionClass}`}
      >
        <Button
          part={`${direction}-arrow-button`}
          style="square-neutral"
          class={`z-1 absolute bottom-0 top-0 flex h-10 w-10 shrink-0 basis-8 items-center justify-center rounded ${
            direction === 'left' ? 'left-0' : 'right-0'
          }`}
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
        </Button>
        <div
          part={`${direction}-fade`}
          class={`from-background-60 pointer-events-none absolute top-0 z-0 h-10 w-20 ${
            direction === 'left'
              ? 'left-0 bg-gradient-to-r'
              : 'right-0 bg-gradient-to-l'
          }`}
        ></div>
      </div>
    );
  }

  public render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    return (
      <div part="scrollable-container" class="relative flex">
        {this.renderArrow('left')}
        <div
          part="horizontal-scroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScrollRef = el)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}
