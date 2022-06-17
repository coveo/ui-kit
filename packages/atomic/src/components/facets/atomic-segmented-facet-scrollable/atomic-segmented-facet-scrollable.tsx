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
  // @State() children: Array<any> = [];

  connectedCallback() {
    // this.children = Array.from(this.host.children);
    // console.log(this.children);

    // const shadowRoot =
    //   this.host.shadowRoot === null
    //     ? this.host.attachShadow({mode: 'open'})
    //     : this.host.shadowRoot;

    console.log(this.host.shadowRoot);
  }

  render() {
    return (
      <div class="flex">
        <div class="border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded">
          <atomic-icon
            class="w-3.5 mx-2 mt-[0.6rem]"
            icon={ArrowLeftIcon}
          ></atomic-icon>
        </div>
        <div class="wrapper-segmented flex flex-row overflow-x-scroll grow">
          <slot></slot>
        </div>
        <div class="border border-neutral bg-background text-on-background hover:bg-neutral-light focus-visible:bg-neutral-light no-outline rounded">
          <atomic-icon
            class="w-3.5 mx-2 mt-[0.6rem]"
            icon={ArrowRightIcon}
          ></atomic-icon>
        </div>
      </div>
    );
  }
}
