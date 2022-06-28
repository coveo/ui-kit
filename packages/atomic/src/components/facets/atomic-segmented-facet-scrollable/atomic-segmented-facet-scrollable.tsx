import {Component, h} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

type ArrowDirection = 'right' | 'left';

/**
 * @internal
 * The 'atomic-segmented-facet-scrollable' component wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities.
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-box - The left arrow box containing both the left arrow button and the fade.
 * @part right-arrow-box - The right arrow box containing both the right arrow button and the fade.
 * @part arrow-button - The arrow button used to scroll left or right
 * @part fade - The white to transparent gradient.
 */

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  private horizontalScroll?: HTMLDivElement;

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScroll;
    const pixelsToScroll = container ? container.clientWidth * 0.75 : 700;

    if (container === null || !container) {
      return;
    }
    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
    } else {
      container.scrollLeft += pixelsToScroll;
    }
  }

  private renderArrow(direction: ArrowDirection) {
    const isLeft: boolean = direction === 'left';
    return (
      <div part={`${direction}-arrow-box`}>
        <Button
          part="arrow-button"
          style="square-neutral"
          class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-10 w-10 top-0 bottom-0 ${
            isLeft ? 'left-0' : 'right-0'
          }`}
          ariaHidden="true"
          onClick={() => this.slideHorizontally(direction)}
        >
          <atomic-icon
            class="w-3.5"
            icon={isLeft ? ArrowLeftIcon : ArrowRightIcon}
          ></atomic-icon>
        </Button>
        <div
          part="fade"
          class={`w-16 h-10 absolute top-0  z-[5] pointer-events-none from-background-80 ${
            isLeft ? 'bg-gradient-to-r left-0' : 'bg-gradient-to-l right-0'
          }`}
        ></div>
      </div>
    );
  }

  render() {
    return (
      <div part="scrollableContainer" class="flex h-10 relative">
        {this.renderArrow('left')}
        <div
          part="horizontalScroll"
          class="wrapper-segmented flex flex-row ml-10 mr-10 overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}
