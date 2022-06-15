import {Component, Element, h, State} from '@stencil/core';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  @Element() private host!: HTMLElement;
  @State() children: Array<any> = [];

  connectedCallback() {
    this.children = Array.from(this.host.children);
    console.log(this.children);
  }

  render() {
    return (
      <div class="flex overflow-x-scroll">
        <slot></slot>
      </div>
    );
  }
}
