import {api, LightningElement} from 'lwc';

import inLabel from "@salesforce/label/c.quantic_InLabel";

/** @typedef {import("coveo").CategoryFacetValue} CategoryFacetValue */

/**
 * The `QuanticCategoryFacetValue` component is used by a `QuanticCategoryFacet` component to display a formatted facet value, path to that value and number of results with that value.
 * @category LWC
 * @fires CustomEvent#selectvalue
 * @example
 * <c-quantic-category-facet-value onselectvalue={onSelect} item={result} withsearch="true"></c-quantic-category-facet-value>
 */
export default class QuanticCategoryFacetValue extends LightningElement {
  /**
   * The facet value to display.
   * @api
   * @type {CategoryFacetValue} */
  @api item;
  /**
   * Whether the value is a search result.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api withsearch = false;
  /** 
   * Whether the value is an active parent node.
   * @api
   * @type {string}
   */
  @api activeparent = false;
  /** 
   * Whether the value is a non-active parent node.
   * @api
   * @type {string}
   * @defaultValue false
   */
  @api nonactiveparent = false;

  labels = {
    inLabel
  }

  get categoryFacetLiClass() {
    if(this.activeparent) {
      return "slds-var-m-horizontal_large slds-grid";
    }
    if(this.nonactiveparent) {
      return "slds-var-m-vertical_small slds-grid"
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
