import {Component, h} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

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
    return [
      <Button
        style="square-neutral"
        class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-10 w-10 top-0 bottom-0 ${
          arrowDirection === ArrowLeftIcon ? 'left-0' : 'right-0'
        }`}
        ariaHidden="true"
        onClick={() => this.slideHorizontally(arrowDirection)}
      >
        <atomic-icon class="w-3.5" icon={arrowDirection}></atomic-icon>
      </Button>,
      <div
        class={`fade w-16 h-10 absolute top-0  z-[5] from-white-80 ${
          arrowDirection === ArrowLeftIcon
            ? 'bg-gradient-to-r left-0'
            : 'bg-gradient-to-l right-0'
        }`}
      ></div>,
    ];
  }

  render() {
    return (
      <div part="scrollableContainer" class="flex h-10 relative">
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
