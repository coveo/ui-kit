import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class QuanticFacetValue extends LightningElement {
  @api item;
  /** @type {boolean} */
  @api isChecked;
  /** @type {string} */
  @api variant = 'default';
  /** @type {boolean} */
  isDefaultFacet = false;
  /** @type {boolean} */
  isNumericFacet = false;
  /** @type {boolean} */
  isDateFacet = false;

  /** @type {string} */
  @api start;
  /** @type {string} */
  @api end;

  connectedCallback() {
    switch (this.variant) {
      case 'numeric': {
        this.isNumericFacet = true;
        break;
      }
      case 'date': {
        this.isDateFacet = true;
        // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
        this.start = new Intl.DateTimeFormat(LOCALE).format(
          new Date(this.item.start)
        );
        // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
        this.end = new Intl.DateTimeFormat(LOCALE).format(
          new Date(this.item.end)
        );
        break;
      }
      default: {
        this.isDefaultFacet = true;
      }
    }
  }

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
