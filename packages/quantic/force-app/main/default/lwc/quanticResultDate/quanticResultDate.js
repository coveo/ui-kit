import LOCALE from '@salesforce/i18n/locale';
import {DateUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultDate` component displays a given result date field value.
 * @category Result Template
 * @example
 * <c-quantic-result-date result={result} label="Date" field="date"></c-quantic-result-date>
 */
export default class QuanticResultDate extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result) to use.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The date field whose values you want to display.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * (Optional) The label to display.
   * @api
   * @type {string}
   * @defaultValue `none`
   */
  @api label;
  /**
   * A function used to format the displayed value.
   * The default format uses the default format for your locale.
   * @api
   * @type {Function}
   * @param {string} value
   * @returns {string}
   */
  @api formattingFunction = (value) =>
    new Intl.DateTimeFormat(LOCALE).format(new Date(value));

  error;

  connectedCallback() {
    if (!this.result || !this.field) {
      console.error(
        `The ${this.template.host.localName} requires a result and a date field to be specified.`
      );
      this.error = `${this.template.host.localName} Error`;
    } else if (!DateUtils.isValidTimestamp(this.fieldValue)) {
      console.error(`Field "${this.field}" does not contain a valid date.`);
      this.error = `${this.template.host.localName} Error`;
    }
  }

  /**
   * The value of the given result field.
   * @returns {number}
   */
  get fieldValue() {
    // @ts-ignore
    return this.result.raw[this.field];
  }
}
