import {Component, h, Host} from '@stencil/core';
import {Result} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

/**
 * The ResultLink component automatically transform a search result title into a clickable link pointing to the
 * original item.
 * @part result-link - The result link
 */
@Component({
  tag: 'atomic-result-link',
  shadow: false,
})
export class AtomicResultValue {
  @ResultContext() private result!: Result;

  @ResultContextRenderer
  public render() {
    return (
      <Host class="block">
        <a
          part="result-link"
          href={this.result.clickUri}
          class="block text-primary visited:text-visited hover:underline"
        >
          <h3>
            <atomic-result-value
              value="title"
              shouldHighlightWith="titleHighlights"
            ></atomic-result-value>
          </h3>
        </a>
      </Host>
    );
  }
}
