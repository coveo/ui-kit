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
  private slide(direction: Event) {
    const container = this.host.shadowRoot?.getElementById('horizontalScroll');

    if (container === null || !container) {
      return;
    }
    let scrollCompleted = 0;
    const slideVar = setInterval(() => {
      if (direction.type === 'scrollLeft') {
        container.scrollLeft -= 80;
      } else {
        container.scrollLeft += 80;
      }
      scrollCompleted += 10;
      if (scrollCompleted >= 100) {
        window.clearInterval(slideVar);
      }
    }, 40);
  }

  render() {
    return (
      <div class="flex h-9">
        <div
          class="flex shrink-0 basis-8 justify-center items-center border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded"
          onClick={() => this.scrollLeft.emit()}
        >
          <atomic-icon class="w-3.5" icon={ArrowLeftIcon}></atomic-icon>
        </div>
        <div
          id="horizontalScroll"
          class="wrapper-segmented flex flex-row overflow-x-scroll"
        >
          <slot></slot>
        </div>
        <div
          class="flex shrink-0 basis-8 justify-center items-center border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded"
          onClick={() => this.scrollRight.emit()}
        >
          <atomic-icon class="w-3.5" icon={ArrowRightIcon}></atomic-icon>
        </div>
      </div>
    );
  }
}
