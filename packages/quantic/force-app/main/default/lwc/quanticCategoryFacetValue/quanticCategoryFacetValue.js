import {api, LightningElement} from 'lwc';

export default class QuanticCategoryFacetValue extends LightningElement {
  /** @type {import("coveo").CategoryFacetValue} */
  @api item;

  /** @type {string} */
  @api withsearch;
  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
