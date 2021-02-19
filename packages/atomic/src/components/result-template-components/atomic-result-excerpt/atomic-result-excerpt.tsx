import {Component, h, Host} from '@stencil/core';

@Component({
  tag: 'atomic-result-excerpt',
  shadow: false,
})
export class AtomicResultExcerpt {
  render() {
    return (
      <Host class="inline-block">
        <atomic-result-value
          value="excerpt"
          should-highlight-with="excerptHighlights"
        ></atomic-result-value>
      </Host>
    );
  }
}
