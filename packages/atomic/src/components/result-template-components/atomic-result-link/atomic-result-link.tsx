import {Component, h} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {filterProtocol} from '../../../utils/utils';

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

  public render() {
    return (
      <a part="result-link" href={filterProtocol(this.result.clickUri)}>
        <atomic-result-text field="title"></atomic-result-text>
      </a>
    );
  }
}
