import {LightningElement, api} from 'lwc';

export default class QuanticDateFacetValue extends LightningElement {
  /** @type {import("coveo").DateFacetValue} */
  @api item;
  /** @type {boolean} */
  @api isChecked;

  /** @type {string} */
  @api start;
  /** @type {string} */
  @api end;

  /**
   * @param {InputEvent} evt
   */
  facetValueClick(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }

  connectedCallback() {
    // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
    this.start = new Date(this.item.start).toLocaleDateString();
    // eslint-disable-next-line  @lwc/lwc/no-api-reassignments
    this.end = new Date(this.item.end).toLocaleDateString();
  }
}
