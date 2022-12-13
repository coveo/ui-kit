import {getBueno} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultText` component displays a given result field value.
 * @category Result Template
 * @example
 * <c-quantic-result-text result={result} label="Source" field="source"></c-quantic-result-text>
 */
export default class QuanticResultText extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result) to use.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * (Optional) The label to display.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api label;
  /**
   * The field whose values you want to display.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The function used to format the displayed value.
   * @api
   * @type {Function}
   * @param {string} value
   * @returns {string}
   */
  @api formattingFunction;

  error;

  connectedCallback() {
    getBueno(this).then(() => {
      if (!this.result || !Bueno.isString(this.field)) {
        console.error(
          `The ${this.template.host.localName} requires a result and a field to be specified.`
        );
        this.error = `${this.template.host.localName} Error`;
      }
      if (this.label && !Bueno.isString(this.label)) {
        console.error(`The "${this.label}" label is not a valid string.`);
        this.error = `${this.template.host.localName} Error`;
      }
    });
  }

  /**
   * The value of the given result field.
   * @returns {string | undefined}
   */
  get fieldValue() {
    // @ts-ignore
    return this.result?.raw[this.field];
  }

  /**
   * Whether the given result has a value for the given field
   * @returns {boolean}
   */
  get hasFieldValue() {
    return !!this.fieldValue;
  }

  /**
   * The value to display.
   * @returns {string | undefined}
   */
  get valueToDisplay() {
    if (this.formattingFunction) {
      return this.formattingFunction(this.fieldValue);
    }
    return this.fieldValue;
  }
}
