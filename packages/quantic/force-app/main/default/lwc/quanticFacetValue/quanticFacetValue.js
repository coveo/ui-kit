import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

/**
 * @typedef FacetValueBase
 * @property {string} value
 * @property {number} numberOfResults
 */

/**
 * The `QuanticFacetValue` component is used by a facet component to display a formatted facet value and the number of results with that value.
 * @fires CustomEvent#selectvalue
 * @category Search
 * @example
 * <c-quantic-facet-value onselectvalue={onSelect} item={result} is-checked={result.checked} display-as-link={displayAsLink} formatting-function={formattingFunction}></c-quantic-facet-value>
 */
export default class QuanticFacetValue extends LightningElement {
  /**
   * The [facet value](https://docs.coveo.com/en/headless/latest/reference/search/controllers/facet/#facetvalue) to display.
   * @api
   * @type {FacetValueBase}
   */
  @api item;
  /**
   * Whether the checkbox is checked.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api isChecked = false;
  /**
   * Whether the facet value should display as a link.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api displayAsLink = false;
  /** 
   * A function used to format the displayed value.
   * @api
   * @type {Function}
   * @defaultValue `undefined`
   */
  @api formattingFunction;

  get isStandardFacet() {
    return !this.formattingFunction;
  }

  get formattedFacetValue() {
    if (this.formattingFunction instanceof Function) {
      return this.formattingFunction(this.item);
    }
    return this.item.value;
  }

  get numberOfResults() {
    return new Intl.NumberFormat(LOCALE).format(this.item.numberOfResults);
  }

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent(
      'selectvalue', {
      detail: {
        value: this.formattedFacetValue
      }
    }));
  }
}
