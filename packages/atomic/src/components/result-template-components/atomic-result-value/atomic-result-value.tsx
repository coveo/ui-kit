import {Component, Prop, Element} from '@stencil/core';
import {Result, resultTemplatesHelpers} from '@coveo/headless';
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
    const resultValue = resultTemplatesHelpers.getResultProperty(
      this.result,
      this.value
    );
    if (resultValue !== null) {
      return resultValue;
    }

    this.host.remove();
  }
}
