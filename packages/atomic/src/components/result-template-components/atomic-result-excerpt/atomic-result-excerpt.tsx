import {Component, h, Host} from '@stencil/core';

/**
 * The ResultExcerpt component renders an excerpt of its associated result and highlights the keywords from the query.
 */
@Component({
  tag: 'atomic-result-excerpt',
  shadow: false,
})
export class AtomicResultExcerpt {
  render() {
    return (
      <Host class="block">
        <atomic-result-value
          value="excerpt"
          should-highlight-with="excerptHighlights"
        ></atomic-result-value>
      </Host>
    );
  }
}
