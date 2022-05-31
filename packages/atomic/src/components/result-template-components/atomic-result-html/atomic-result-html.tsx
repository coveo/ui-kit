import {Component, Prop, h, Element, State} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {getStringValueFromResultOrNull} from '../../../utils/result-utils';

/**
 * The `atomic-result-html` component renders the HTML value of a string result field.
 *
 * There is an inherent XSS security concern associated with the usage of this component.
 *
 * Use only with fields for which you are certain the data is harmless.
 */
@Component({
  tag: 'atomic-result-html',
  shadow: false,
})
export class AtomicResultHtml implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   *  The result field which the component should use.
   * If set, Atomic searches for the specified field in the `Result` object first.
   * If there's no such a field, Atomic searches throught the `Result.raw` object.
   * It's important to include the necessary field in the `ResultList` component.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * Specify if the content should be sanitized, using [`DOMPurify`](https://www.npmjs.com/package/dompurify).
   */
  @Prop({reflect: true}) public sanitize = true;

  public render() {
    const resultValue = getStringValueFromResultOrNull(this.result, this.field);
    if (!resultValue) {
      this.host.remove();
      return;
    }

    return (
      <atomic-html value={resultValue} sanitize={this.sanitize}></atomic-html>
    );
  }
}
