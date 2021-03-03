import {Component, Prop, Element, State} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';

/**
 * The ResultCurrencyValue component renders the value of a price result property.
 */
@Component({
  tag: 'atomic-result-currency-value',
  shadow: false,
})
export class AtomicResultCurrencyValue {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The result property which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() property = 'ec_price';
  /**
   * The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB — see the [Current currency & funds code list](http://www.currency-iso.org/en/home/tables/table-a1.html).
   */
  @Prop() currency = 'USD';
  /**
   * The exchange rate multiplier with which to convert the currency from the indexed value.
   */
  @Prop() exchangeRateMultiplier = 1;

  public render() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.property
    );

    if (value === null) {
      this.host.remove();
      return;
    }

    return (
      parseFloat(`${value}`) * this.exchangeRateMultiplier
    ).toLocaleString(this.bindings.i18n.languages, {
      currency: this.currency,
      style: 'currency',
    });
  }
}
