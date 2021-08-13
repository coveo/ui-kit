import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class QuanticFacetValue extends LightningElement {
  @api item;
  /** @type {boolean} */
  @api isChecked;
  /** @type {string} */
  @api variant = 'standard';
  /** @type {string} */
  @api start;
  /** @type {string} */
  @api end;

  Variants = {
    StandardFacet: 'standard',
    NumericFacet: 'numeric',
    DateFacet: 'date',
  };

  connectedCallback() {
    if (this.isDateFacet) {
      // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
      this.start = new Intl.DateTimeFormat(LOCALE).format(
        new Date(this.item.start)
      );
      // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
      this.end = new Intl.DateTimeFormat(LOCALE).format(
        new Date(this.item.end)
      );
    }
  }

  get isDefaultFacet() {
    return this.variant === this.Variants.StandardFacet;
  }

  get isNumericFacet() {
    return this.variant === this.Variants.NumericFacet;
  }

  get isDateFacet() {
    return this.variant === this.Variants.DateFacet;
  }

  getFormattedFacetValue() {
    if (this.isDateFacet) {
      return `${this.start} - ${this.end}`;
    } else if (this.isNumericFacet) {
      return `${this.item.start} - ${this.item.end}`;
    }
    return this.item.value;
  }

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
