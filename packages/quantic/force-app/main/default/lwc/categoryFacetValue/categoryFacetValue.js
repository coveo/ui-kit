import {api, LightningElement} from 'lwc';

export default class CategoryFacetValue extends LightningElement {
  /** @type {import("coveo").CategoryFacetValue} */
  @api item;

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent("selectvalue", { detail: this.item }));
  }
}
