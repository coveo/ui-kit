// @ts-check
import { LightningElement, api, track } from "lwc";

export default class Facetvalue extends LightningElement {
  /** @type {import("coveo").FacetValue} */
  @api item;

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent("selectvalue", { detail: this.item }));
  }
}
