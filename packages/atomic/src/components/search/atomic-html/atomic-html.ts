import {Schema, StringValue} from '@coveo/bueno';
import DOMPurify from 'dompurify';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-html` component renders the HTML value of a string.
 *
 * There is an inherent XSS security concern associated with the usage of this component.
 *
 * Use only with values for which you are certain the content is harmless.
 */
@customElement('atomic-html')
@bindings()
@withTailwindStyles
export class AtomicHtml
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() bindings!: Bindings;
  @state() error!: Error;

  /**
   * The string value containing HTML to display;
   */
  @property({type: String, reflect: false}) value!: string;
  /**
   * Specify if the content should be sanitized, using [`DOMPurify`](https://www.npmjs.com/package/dompurify).
   */
  @property({type: Boolean, reflect: true}) sanitize = true;

  public initialize() {
    this.validateProps();
  }

  @errorGuard()
  public render() {
    return html`<span
      .innerHTML=${this.sanitize ? DOMPurify.sanitize(this.value) : this.value}
    ></span>`;
  }

  private validateProps() {
    new Schema({
      value: new StringValue({emptyAllowed: false}),
    }).validate({
      value: this.value,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-html': AtomicHtml;
  }
}
