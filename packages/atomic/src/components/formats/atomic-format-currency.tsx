import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchNumberFormatEvent} from './format-common';

/**
 * The `atomic-format-currency` component is used for formatting currencies.
 * It will set the numerical format on compatible parents according to the options.
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
   * See the current [currency & funds code list](https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-currency-codes).
   */
  @Prop() public currency!: string;

  componentWillLoad() {
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this.host
      );
    } catch (error) {
      this.error = error;
    }
  }

  private format(value: number | string, languages: string[]) {
    return parseFloat(`${value}`).toLocaleString(languages, {
      style: 'currency',
      currency: this.currency,
    });
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
