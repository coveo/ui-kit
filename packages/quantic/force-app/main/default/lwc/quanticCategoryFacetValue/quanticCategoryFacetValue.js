import {api, LightningElement} from 'lwc';

import inLabel from "@salesforce/label/c.quantic_InLabel";
export default class QuanticCategoryFacetValue extends LightningElement {
  /** @type {import("coveo").CategoryFacetValue} */
  @api item;
  /** @type {string} */
  @api withsearch;
  /**  @type {string} */
  @api activeparent;
  /**  @type {boolean}*/
  @api nonactiveparent;

  labels = {
    inLabel
  }
  get categoryFacetLiClass() {
    if(this.activeparent) {
      return "slds-var-m-horizontal_large slds-grid";
    }
    if(this.nonactiveparent) {
      return "slds-var-m-horizontal_small slds-var-m-vertical_small slds-grid"
    }
    return "slds-grid";
  }
  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
