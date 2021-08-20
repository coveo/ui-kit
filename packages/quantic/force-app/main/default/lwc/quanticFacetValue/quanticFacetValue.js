import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class QuanticFacetValue extends LightningElement {
  @api item;
  /** @type {boolean} */
  @api isChecked;
  /** @type {string} */
  @api variant = 'standard';
  /** @type {(any) => string} */
  @api formattingFunction;

  Variants = {
    StandardFacet: 'standard',
    NumericFacet: 'numeric',
    DateFacet: 'date',
    Custom: 'custom'
  };

  get startDate() {
    if (!this.isDateFacet) {
      return undefined;
    }
    return new Intl.DateTimeFormat(LOCALE).format(
      new Date(this.item.start)
    );
  }

  get endDate() {
    if (!this.isDateFacet) {
      return undefined;
    }
    return new Intl.DateTimeFormat(LOCALE).format(
      new Date(this.item.end)
    );
  }

  get isStandardFacet() {
    return this.variant === this.Variants.StandardFacet;
  }

  get isNumericFacet() {
    const isNumericItem = this.item.start !== undefined && this.item.end !== undefined;
    return this.variant === this.Variants.NumericFacet && isNumericItem;
  }

  get isDateFacet() {
    const isDateItem = this.item.start !== undefined && this.item.end !== undefined;
    return this.variant === this.Variants.DateFacet && isDateItem;
  }

  get isCustom() {
    return this.variant === this.Variants.Custom && this.formattingFunction instanceof Function;
  }

  get formattedFacetValue() {
    if (this.isDateFacet) {
      return `${this.startDate} - ${this.endDate}`;
    } else if (this.isNumericFacet) {
      return `${this.item.start} - ${this.item.end}`;
    } else if (this.isCustom) {
      return this.formattingFunction(this.item);
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
