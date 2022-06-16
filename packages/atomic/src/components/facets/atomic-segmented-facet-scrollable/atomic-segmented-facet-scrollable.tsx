import {Component, Element, h} from '@stencil/core';

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
      <div class="wrapper-segmented flex flex-row overflow-x-scroll">
        <slot></slot>
      </div>
    );
  }
}
