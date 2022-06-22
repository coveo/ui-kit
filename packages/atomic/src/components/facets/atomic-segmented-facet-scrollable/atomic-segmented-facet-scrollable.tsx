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

  private horizonalSlider(arrowDirection: string) {
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
        class={`flex shrink-0 basis-8 justify-center items-center rounded ${
          arrowDirection === ArrowLeftIcon
            ? 'z-10 shadow-[15px_1px_10px_5px] [clip-path:inset(0 -35px 0 0)]'
            : 'shadow-[-15px_1px_10px_5px] [clip-path:inset(0 0 0 -35px)] clipPath-right'
        }`}
        ariaHidden="true"
        onClick={() => this.horizonalSlider(arrowDirection)}
      >
        <atomic-icon class="w-3.5" icon={arrowDirection}></atomic-icon>
      </Button>
    );
  }

  render() {
    return (
      <div class="flex h-9">
        {this.renderArrow(ArrowLeftIcon)}
        <div
          id="horizontalScroll"
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
