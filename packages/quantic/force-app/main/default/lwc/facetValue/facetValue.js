import {LightningElement, api} from 'lwc';

export default class FacetValue extends LightningElement {
  /** @type {import("coveo").FacetValue} */
  @api item;

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
