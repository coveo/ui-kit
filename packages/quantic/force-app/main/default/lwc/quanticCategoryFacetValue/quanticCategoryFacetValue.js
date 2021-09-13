import {api, LightningElement} from 'lwc';

import inLabel from "@salesforce/label/c.quantic_InLabel";
export default class QuanticCategoryFacetValue extends LightningElement {
  /** @type {import("coveo").CategoryFacetValue} */
  @api item;
  /** @type {string} */
  @api withsearch;

  labels = {
    inLabel
  }
  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
