import {Component, h} from '@stencil/core';

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
      <atomic-result-value
        value="excerpt"
        shouldHighlightWith="excerptHighlights"
      ></atomic-result-value>
    );
  }
}
