import { LightningElement, api } from "lwc";

export default class QuanticNumericFacetValue extends LightningElement {
  /** @type {import("coveo").NumericFacetValue} */
  @api item;
  /** @type {boolean} */
  @api isChecked;

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
