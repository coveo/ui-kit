import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class QuanticFacetValue extends LightningElement {
  /** @type {import("coveo").FacetValue} */
  @api item;
  /** @type {import("coveo").NumericFacetValue} */
  @api numericItem;
  /** @type {import("coveo").DateFacetValue} */
  @api dateItem;
  /** @type {boolean} */
  @api isChecked;
  /** @type {string} */
  @api facetType;
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
    switch (this.facetType) {
      case 'default': {
        this.isDefaultFacet = true;
        break;
      }
      case 'numeric': {
        this.isNumericFacet = true;
        break;
      }
      case 'date': {
        this.isDateFacet = true;
        // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
        this.start = new Intl.DateTimeFormat(LOCALE).format(
          new Date(this.dateItem.start)
        );
        // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
        this.end = new Intl.DateTimeFormat(LOCALE).format(
          new Date(this.dateItem.end)
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
    switch (this.facetType) {
      case 'default': {
        this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
        break;
      }
      case 'numeric': {
        this.dispatchEvent(
          new CustomEvent('selectvalue', {detail: this.numericItem})
        );
        break;
      }
      case 'date': {
        this.dispatchEvent(
          new CustomEvent('selectvalue', {detail: this.dateItem})
        );
        break;
      }
      default:
    }
  }
}
