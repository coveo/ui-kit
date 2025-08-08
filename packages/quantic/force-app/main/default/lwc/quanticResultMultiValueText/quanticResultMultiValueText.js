import nMore from '@salesforce/label/c.quantic_NMore';
import {getBueno} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultMultiValueText` component displays a given result multi-value field value.
 * Make sure the field specified in this component is also included in the field array for the relevant template. See the this example: [Quantic usage](https://docs.coveo.com/en/quantic/latest/usage/#javascript).
 * @category Result Template
 * @example
 * <template if:true={result.raw.language}>
 *   <c-quantic-result-multi-value-text result={result} label="Languages" field="language" max-values-to-display="4"></c-quantic-result-multi-value-text>
 * </template>
 */
export default class QuanticResultMultiValueText extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html) to use.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The multi-value field whose values you want to display.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * (Optional) The label to display.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api label;
  /**
   * The delimiter used to separate values when the field isn’t indexed as a multi value field.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api delimiter;
  /**
   * The maximum number of field values to display. If there are _n_ more values than the specified maximum, the last displayed value will be "_n more..._".
   * @api
   * @type {number}
   * @defaultValue `3`
   */
  @api maxValuesToDisplay = 3;

  /** @type {string} */
  error;
  joinSeparator = ', ';
  validated = false;

  labels = {
    nMore,
  };

  connectedCallback() {
    getBueno(this).then(() => {
      if (!this.result || !this.field || !Bueno.isString(this.field)) {
        console.error(
          `The ${this.template.host.localName} requires a result and a multi-value field to be specified.`
        );
        this.setError();
      }
      if (this.label && !Bueno.isString(this.label)) {
        console.error(`The "${this.label}" label is not a valid string.`);
        this.setError();
      }
      if (!this.fieldValue) {
        console.error(
          `Could not parse value from field "${this.field}" as a string array.`
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
   * @returns {string[]}
   */
  get fieldValue() {
    if (!this.field) {
      return undefined;
    }
    const value = this.result?.raw[this.field];

    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.map((v) => `${v}`.trim());
    }
    if (!Bueno?.isString(value)) {
      return undefined;
    }
    if (value.trim() === '') {
      return undefined;
    }

    return this.delimiter
      ? value.split(this.delimiter).map((v) => v.trim())
      : [value];
  }

  /**
   * The value to display.
   * @returns {string | undefined}
   */
  get valueToDisplay() {
    const value = this.fieldValue;
    if (value.length <= this.maxValuesToDisplay) {
      return value.join(this.joinSeparator);
    }
    const truncatedArray = value.slice(0, this.maxValuesToDisplay);
    truncatedArray.push(
      I18nUtils.format(
        this.labels.nMore,
        value.length - this.maxValuesToDisplay
      )
    );
    return truncatedArray.join(this.joinSeparator);
  }
}
