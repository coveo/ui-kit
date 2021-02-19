import {Component, h, Host} from '@stencil/core';
import {Result} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

@Component({
  tag: 'atomic-result-link',
  shadow: false,
})
export class AtomicResultValue {
  @ResultContext() private result!: Result;

  @ResultContextRenderer
  public render() {
    return (
      <Host class="inline-block">
        <a
          href={this.result.clickUri}
          class="inline-block text-primary hover:underline visited:text-visited"
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
