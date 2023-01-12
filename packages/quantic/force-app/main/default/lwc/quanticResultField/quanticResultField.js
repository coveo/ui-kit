import {LightningElement, api} from 'lwc';
// @ts-ignore
import dateTemplate from './dateTemplate.html';
// @ts-ignore
import multiValueTemplate from './multiValueTemplate.html';
// @ts-ignore
import numberTemplate from './numberTemplate.html';
// @ts-ignore
import stringTemplate from './stringTemplate.html';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultField` component properly displays a given result field according to its type.
 * @category Result Template
 * @example
 * <template if:true={result.raw.source}>
 *   <c-quantic-result-field result={result} label="Source" field="source" type="string"></c-quantic-result-field>
 * </template>
 */
export default class QuanticResultField extends LightningElement {
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
   * @defaultValue `none`
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

  render() {
    if (this.type === 'multi') {
      return multiValueTemplate;
    } else if (this.type === 'number') {
      return numberTemplate;
    } else if (this.type === 'date') {
      return dateTemplate;
    }
    return stringTemplate;
  }
}
