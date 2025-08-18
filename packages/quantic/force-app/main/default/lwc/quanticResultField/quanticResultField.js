import {LightningElement, api} from 'lwc';
// @ts-ignore
import dateTemplate from './dateTemplate.html';
// @ts-ignore
import errorTemplate from './errorTemplate.html';
// @ts-ignore
import multiValueTemplate from './multiValueTemplate.html';
// @ts-ignore
import numberTemplate from './numberTemplate.html';
// @ts-ignore
import stringTemplate from './stringTemplate.html';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultField` component properly displays a given result field according to its type.
 * Make sure the field specified in this component is also included in the field array for the relevant template. See the this example: [Quantic usage](https://docs.coveo.com/en/quantic/latest/usage/#javascript).
 * @category Result Template
 * @example
 * <template if:true={result.raw.source}>
 *   <c-quantic-result-field result={result} label="Source" field="source" type="string"></c-quantic-result-field>
 * </template>
 */
export default class QuanticResultField extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html) to use.
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
   * The field name whose values you want to display.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The field type whose values you want to display.
   * @type { 'string' | 'date' | 'number' | 'multi'}
   */
  @api type;

  /** @type {string} */
  error;
  templateTypeMap = {
    multi: multiValueTemplate,
    number: numberTemplate,
    date: dateTemplate,
    string: stringTemplate,
  };

  connectedCallback() {
    const templateTypes = Object.keys(this.templateTypeMap);
    if (!templateTypes.includes(this.type)) {
      console.error(
        `The provided type "${
          this.type
        }" is invalid. The type must be one of ${templateTypes.join(' | ')}`
      );
      this.setError();
    }
  }

  setError() {
    this.error = `${this.template.host.localName} Error`;
  }

  render() {
    if (this.error) {
      return errorTemplate;
    }
    return this.templateTypeMap[this.type] || this.templateTypeMap.default;
  }
}
