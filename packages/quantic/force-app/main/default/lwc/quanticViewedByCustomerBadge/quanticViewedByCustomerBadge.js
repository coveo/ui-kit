import viewedByCustomer from '@salesforce/label/c.quantic_ViewedByCustomer';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticViewedByCustomerBadge` component displays a badge that indicates that the customer has viewed a given result.
 * @category Result Template
 * @example
 * <c-quantic-viewed-by-customer-badge result={result}></c-quantic-viewed-by-customer-badge>
 */
export default class QuanticViewedByCustomerBadge extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html).
   * @api
   * @type {Result}
   */
  @api result;

  labels = {
    viewedByCustomer,
  };

  /** @type {boolean} */
  hasInitializationError;

  connectedCallback() {
    if (!this.result) {
      this.setInitializationError(
        `The ${this.template.host.localName} requires the result attribute to be set.`
      );
    }
  }

  get shouldDisplayBadge() {
    // @ts-ignore
    return !this.hasInitializationError && this?.result?.isUserActionView;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError(message) {
    this.hasInitializationError = true;
    console.error(message);
  }
}
