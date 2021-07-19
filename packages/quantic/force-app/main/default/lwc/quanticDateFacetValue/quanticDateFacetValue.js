import {LightningElement, api} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class QuanticDateFacetValue extends LightningElement {
  /** @type {import("coveo").DateFacetValue} */
  @api item;

  /** @type {string} */
  @api start;
  /** @type {string} */
  @api end;

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }

  connectedCallback() {
    // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
    this.start = new Intl.DateTimeFormat(LOCALE).format(new Date(this.item.start));
    // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
    this.end = new Intl.DateTimeFormat(LOCALE).format(new Date(this.item.end));
  }
}
