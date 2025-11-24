import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  defaultCurrencyFormatter,
  dispatchNumberFormatEvent,
  NumberFormatter,
} from '../../common/formats/format-common';

/**
 * The `atomic-format-currency` component is used for formatting currencies.
 * The numerical format of compatible parents will be set according to the currency property of this component.
 *
 * @deprecated Use the format properties (currency, minimumFractionDigits, etc.) directly on the parent component instead of using this component.
 */
@Component({
  tag: 'atomic-format-currency',
  shadow: true,
})
export class AtomicFormatCurrency {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB.
   * See the current [currency & funds code list](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=maintenance-agency).
   */
  @Prop({reflect: true}) public currency!: string;

  private format!: NumberFormatter;

  componentWillLoad() {
    this.format = defaultCurrencyFormatter(this.currency);
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this.host
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
