import {Component, h} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '@components/common/button';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  render() {
    return (
      <div class="flex h-9">
        <Button
          style="square-neutral"
          class="flex shrink-0 basis-8 justify-center items-center rounded"
          ariaHidden="true"
        >
          <atomic-icon class="w-3.5" icon={ArrowLeftIcon}></atomic-icon>
        </Button>
        <div class="wrapper-segmented flex flex-row overflow-x-scroll">
          <slot></slot>
        </div>
        <Button
          style="square-neutral"
          class="flex shrink-0 basis-8 justify-center items-center rounded"
          ariaHidden="true"
        >
          <atomic-icon class="w-3.5" icon={ArrowRightIcon}></atomic-icon>
        </Button>
      </div>
    );
  }
}
