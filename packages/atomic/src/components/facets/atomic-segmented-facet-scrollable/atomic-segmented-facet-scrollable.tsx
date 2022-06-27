import {Component, h} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

/**
 * @internal
 * An 'atomic-segmented-facet-scrollable' wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities
 * @part scrollableContainer - wrapper for the entire component including the horizontalScroll and the arrow buttons
 * @part horizontalScroll - The scrollable container for the segmented facets
 */

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  private horizontalScroll?: HTMLDivElement;

  private slideHorizontally(arrowDirection: string) {
    const container = this.horizontalScroll;
    const pixelsToScroll = container ? container.clientWidth * 0.75 : 700;

    if (container === null || !container) {
      return;
    }
    if (arrowDirection === ArrowLeftIcon) {
      container.scrollLeft -= pixelsToScroll;
    } else {
      container.scrollLeft += pixelsToScroll;
    }
  }

  private renderArrow(arrowDirection: string) {
    return (
      <Button
        style="square-neutral"
        class="flex shrink-0 basis-8 justify-center items-center rounded"
        ariaHidden="true"
        onClick={() => this.slideHorizontally(arrowDirection)}
      >
        <atomic-icon class="w-3.5" icon={arrowDirection}></atomic-icon>
      </Button>
    );
  }

  render() {
    return (
      <div part="scrollableContainer" class="flex h-9">
        {this.renderArrow(ArrowLeftIcon)}
        <div
          part="horizontalScroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.renderArrow(ArrowRightIcon)}
      </div>
    );
  }
}
