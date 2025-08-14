import LOCALE from '@salesforce/i18n/locale';
import {getBueno} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultDate` component displays a given result date field value.
 * Make sure the field specified in this component is also included in the field array for the relevant template. See the this example: [Quantic usage](https://docs.coveo.com/en/quantic/latest/usage/#javascript).
 * @category Result Template
 * @example
 * <template if:true={result.raw.date}>
 *   <c-quantic-result-date result={result} label="Date" field="date"></c-quantic-result-date>
 * </template>
 */
export default class QuanticResultDate extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html) to use.
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
   * By default, the date is formatted using the browser locale.
   * @api
   * @type {Function}
   * @param {number} value
   * @returns {string}
   */
  @api formattingFunction = (value) =>
    new Intl.DateTimeFormat(LOCALE).format(new Date(value));

  /** @type {string} */
  error;
  validated = false;

  connectedCallback() {
    getBueno(this).then(() => {
      if (!this.result || !this.field || !Bueno.isString(this.field)) {
        console.error(
          `The ${this.template.host.localName} requires a result and a date field to be specified.`
        );
        this.setError();
      }
      if (this.label && !Bueno.isString(this.label)) {
        console.error(`The "${this.label}" label is not a valid string.`);
        this.setError();
      }
      if (!Bueno.isNumber(this.fieldValue)) {
        console.error(
          `The "${this.field}" field value is not a valid timestamp.`
        );
        this.setError();
      }
      this.validated = true;
    });
  }

  setError() {
    this.error = `${this.template.host.localName} Error`;
  }

  /**
   * Whether the field value can be displayed.
   * @returns {boolean}
   */
  get isValid() {
    return this.validated && !this.error;
  }

  /**
   * The value of the given result field.
   * @returns {number}
   */
  get fieldValue() {
    // @ts-ignore
    return this.field ? this.result?.raw[this.field] : undefined;
  }
}
