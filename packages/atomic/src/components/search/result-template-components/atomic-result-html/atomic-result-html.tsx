import {Result} from '@coveo/headless';
import {Component, Prop, h, Element, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {getStringValueFromResultOrNull} from '../../../../utils/result-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/stencil-result-template-decorators';

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
   * If there's no such a field, Atomic searches through the `Result.raw` object.
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
