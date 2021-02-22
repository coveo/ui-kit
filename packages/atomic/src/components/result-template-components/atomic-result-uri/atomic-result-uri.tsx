import {Component, h, Host} from '@stencil/core';
import {Result} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

/**
 * The ResultUri component displays the URI, or path, to access a result.
 * @part result-uri - The result uri
 */
@Component({
  tag: 'atomic-result-uri',
  shadow: false,
})
export class AtomicResultUri {
  @ResultContext() private result!: Result;

  @ResultContextRenderer
  public render() {
    return (
      <Host class="block">
        <a
          part="result-uri"
          href={this.result.clickUri}
          class="block text-primary visited:text-visited hover:underline"
        >
          <atomic-result-value
            value="printableUri"
            shouldHighlightWith="printableUriHighlights"
          ></atomic-result-value>
        </a>
      </Host>
    );
  }
}
