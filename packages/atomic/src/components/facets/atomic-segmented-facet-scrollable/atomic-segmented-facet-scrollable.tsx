import {Component, Element, h, State} from '@stencil/core';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  shadow: false,
})
export class AtomicSegmentedFacetScrollable {
  @Element() private host!: HTMLElement;
  @State() children: Array<any> = [];

  componentWillLoad() {
    this.children = Array.from(
      this.host.getElementsByTagName('atomic-segmented-facet')
    );

    console.log(this.children.map((child) => child.label));

    this.children.forEach(this.host.removeChild);
  }

  render() {
    return (
      <div class="flex overflow-x-scroll">
        {this.children.map((child) => (
          <atomic-segmented-facet
            label={child.label}
            field={child.field}
          ></atomic-segmented-facet>
        ))}
      </div>
    );
  }
}
