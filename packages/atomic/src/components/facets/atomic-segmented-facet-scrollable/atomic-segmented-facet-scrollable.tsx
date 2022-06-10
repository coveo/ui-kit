import {Component, h, State} from '@stencil/core';

@Component({
  tag: 'atomic-segmented-facet-scrollable',
})
export class AtomicSegmentedFacetScrollable {
  @State() children: Array<any> = [];

  render() {
    return <div class="overflow-x-scroll"></div>;
  }
}
