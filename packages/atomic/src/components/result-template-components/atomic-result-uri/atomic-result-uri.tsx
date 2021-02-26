import {Component, h} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';

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

  public render() {
    return (
      <a part="result-uri" href={this.result.clickUri}>
        <atomic-result-value
          value="printableUri"
          shouldHighlightWith="printableUriHighlights"
        ></atomic-result-value>
      </a>
    );
  }
}
