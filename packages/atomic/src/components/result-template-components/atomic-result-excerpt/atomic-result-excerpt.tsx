import {Result} from '@coveo/headless';
import {Component, h, Element} from '@stencil/core';
import {ResultContext} from '../result-template-decorators';

/**
 * The ResultExcerpt component renders an excerpt of its associated result and highlights the keywords from the query.
 * @part result-excerpt - The result excerpt value
 */
@Component({
  tag: 'atomic-result-excerpt',
  shadow: false,
})
export class AtomicResultExcerpt {
  @ResultContext() private result!: Result;
  @Element() host!: HTMLElement;

  public render() {
    if (!this.result.excerpt || this.result.excerpt.trim() === '') {
      this.host.remove();
      return;
    }

    return (
      <atomic-result-value
        part="result-excerpt"
        value="excerpt"
        shouldHighlightWith="excerptHighlights"
      ></atomic-result-value>
    );
  }
}
