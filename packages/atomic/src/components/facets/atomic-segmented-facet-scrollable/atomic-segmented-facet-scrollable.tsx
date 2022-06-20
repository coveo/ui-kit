import {Component, Element, h} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  @Element() private host!: HTMLElement;

  render() {
    return (
      <div class="flex h-9">
        <div class="flex shrink-0 basis-8 justify-center items-center border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded">
          <atomic-icon class="w-3.5" icon={ArrowLeftIcon}></atomic-icon>
        </div>
        <div class="wrapper-segmented flex flex-row overflow-x-scroll">
          <slot></slot>
        </div>
        <div class="flex shrink-0 basis-8 justify-center items-center border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded">
          <atomic-icon class="w-3.5" icon={ArrowRightIcon}></atomic-icon>
        </div>
      </div>
    );
  }
}
