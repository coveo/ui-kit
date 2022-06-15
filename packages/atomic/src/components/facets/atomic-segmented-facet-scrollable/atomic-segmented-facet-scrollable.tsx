import {Component, Element, h, State} from '@stencil/core';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
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

    if (this.host.shadowRoot !== null) {
      this.host.shadowRoot.innerHTML = `
        <style>
          .wrapper-segmented {
            display: flex;
            flex-direction: row;
            overflow-x: scroll;
            width: 80px;
          }
        </style>
        <div>
          <slot></slot>
        </div>
      `;
    }
  }

  render() {
    return (
      <div class="wrapper-segmented flex relative overflow-x-scroll">
        <slot></slot>
      </div>
    );
  }
}
