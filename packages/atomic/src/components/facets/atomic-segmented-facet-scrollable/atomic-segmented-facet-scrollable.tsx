import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  @Element() private host!: HTMLElement;
  @Event({bubbles: false}) scrollLeft!: EventEmitter;
  @Event({bubbles: false}) scrollRight!: EventEmitter;

  @Listen('scrollLeft')
  @Listen('scrollRight')
  private horizonalSlider(direction: Event) {
    const container = this.host.shadowRoot?.getElementById('horizontalScroll');
    const pixelsToScroll = 780;

    if (container === null || !container) {
      return;
    }
    if (direction.type === 'scrollLeft') {
      container.scrollLeft -= pixelsToScroll;
    } else {
      container.scrollLeft += pixelsToScroll;
    }
  }

  render() {
    return (
      <div class="flex h-9">
        <Button
          style="square-neutral"
          class="flex shrink-0 basis-8 justify-center items-center rounded"
          ariaHidden="true"
          onClick={() => this.scrollLeft.emit()}
        >
          <atomic-icon class="w-3.5" icon={ArrowLeftIcon}></atomic-icon>
        </Button>
        <div
          id="horizontalScroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll scroll-smooth"
        >
          <slot></slot>
        </div>
        <Button
          style="square-neutral"
          class="flex shrink-0 basis-8 justify-center items-center rounded"
          ariaHidden="true"
          onClick={() => this.scrollRight.emit()}
        >
          <atomic-icon class="w-3.5" icon={ArrowRightIcon}></atomic-icon>
        </Button>
      </div>
    );
  }
}
