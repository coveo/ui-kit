import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  defaultCurrencyFormatter,
  dispatchNumberFormatEvent,
  type NumberFormatter,
} from '@/src/components/common/formats/format-common.js';
import '@/src/components/common/atomic-component-error/atomic-component-error.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types.js';

/**
 * The `atomic-format-currency` component is used for formatting currencies.
 * The numerical format of compatible parents will be set according to the currency property of this component.
 */
@customElement('atomic-format-currency')
export class AtomicFormatCurrency
  extends LitElement
  implements LitElementWithError
{
  /**
   * The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB.
   * See the current [currency & funds code list](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=maintenance-agency).
   */
  @property({reflect: true}) currency!: string;

  @state() public error!: Error;

  private format!: NumberFormatter;

  connectedCallback() {
    super.connectedCallback();
    this.format = defaultCurrencyFormatter(this.currency);
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  @errorGuard()
  render() {
    return html`${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-format-currency': AtomicFormatCurrency;
  }
}
