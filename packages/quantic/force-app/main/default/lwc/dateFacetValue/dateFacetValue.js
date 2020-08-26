// @ts-check
import { LightningElement, api } from "lwc";

export default class DateFacetValue extends LightningElement {
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
    this.dispatchEvent(new CustomEvent("selectvalue", { detail: this.item }));
  }

  connectedCallback() {
    this.start = new Date(this.item.start).toLocaleDateString();
    this.end = new Date(this.item.end).toLocaleDateString();
  }
}
