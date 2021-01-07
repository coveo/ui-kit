import {Component, h} from '@stencil/core';
import {Result} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

@Component({
  tag: 'atomic-result-link',
  styleUrl: 'atomic-result-link.css',
  shadow: true,
})
export class AtomicResultValue {
  @ResultContext() private result!: Result;

  @ResultContextRenderer
  public render() {
    return (
      <a href={this.result.clickUri}>
        <slot>
          <h3>{this.result.title}</h3>
        </slot>
      </a>
    );
  }
}
