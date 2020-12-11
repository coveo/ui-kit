import {Component, h} from '@stencil/core';

@Component({
  tag: 'atomic-result-excerpt',
  shadow: false,
})
export class AtomicResultExcerpt {
  render() {
    return (
      <atomic-result-value
        value="excerpt"
        should-highlight-with="excerptHighlights"
      ></atomic-result-value>
    );
  }
}
