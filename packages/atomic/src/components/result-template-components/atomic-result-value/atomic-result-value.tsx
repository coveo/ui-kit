import {Component, Prop, Element} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

@Component({
  tag: 'atomic-result-value',
  shadow: true,
})
export class AtomicResultValue {
  @Element() host!: HTMLDivElement;
  @Prop() value = '';

  @ResultContext() private result!: Result;

  componentWillLoad() {}

  @ResultContextRenderer
  public render() {
    const resultValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.value
    );
    if (resultValue !== null) {
      return resultValue;
    }

    this.host.remove();
  }
}
