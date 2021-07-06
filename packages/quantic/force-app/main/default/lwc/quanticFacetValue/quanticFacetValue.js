import {LightningElement, api} from 'lwc';

export default class QuanticFacetValue extends LightningElement {
  /** @type {import("coveo").FacetValue} */
  @api item;
  /** @type {boolean} */
  @api isChecked;

  /**
   * @param {InputEvent} evt
   */
  facetValueClick(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
