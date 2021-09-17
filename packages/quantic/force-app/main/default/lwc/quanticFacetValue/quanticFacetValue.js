import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

/**
 * @typedef FacetValueBase
 * @property {string} value
 * @property {number} numberOfResults
 */

/**
 * The `QuanticFacetValue` component is used by a facet component to display a formatted facet value and number of results with that value.
 * @category LWC
 * @fires CustomEvent#selectvalue
 * @example
 * <c-quantic-facet-value onselectvalue={onSelect} item={result} is-checked={result.checked}></c-quantic-facet-value>
 */
export default class QuanticFacetValue extends LightningElement {
  /**
   * The facet value to display.
   * @api
   * @type {FacetValueBase}
   */
  @api item;
  /**
   * Whether the checkbox ist checked.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api isChecked;
  /** 
   * A function used to format the displayed value.
   * @api
   * @type {Function}
   * @defaultValue undefined
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
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
