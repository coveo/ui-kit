import type {Result} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {getStringValueFromResultOrNull} from '@/src/utils/result-utils';
import '../atomic-html/atomic-html';

/**
 * The `atomic-result-html` component renders the HTML value of a string result field.
 *
 * There is an inherent XSS security concern associated with the usage of this component.
 *
 * Use only with fields for which you are certain the data is harmless.
 */
@customElement('atomic-result-html')
@bindings()
export class AtomicResultHtml
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  /**
   * The result field which the component should use.
   * If set, Atomic searches for the specified field in the `Result` object first.
   * If there's no such a field, Atomic searches through the `Result.raw` object.
   * It's important to include the necessary field in the `ResultList` component.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * Whether to sanitize the content using [`DOMPurify`](https://www.npmjs.com/package/dompurify).
   */
  @property({type: Boolean, reflect: true}) public sanitize = true;

  @state() private result!: Result;

  private resultController = createResultContextController(this);

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${when(this.result && this.field, () => this.renderResultHtml())}
    `;
  }

  private renderResultHtml() {
    const resultValue = getStringValueFromResultOrNull(this.result, this.field);
    if (!resultValue) {
      return this.remove();
    }

    return html`
      <atomic-html
        .value=${resultValue}
        .sanitize=${this.sanitize}
      ></atomic-html>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-html': AtomicResultHtml;
  }
}
