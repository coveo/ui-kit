import {api, LightningElement} from 'lwc';

import inLabel from '@salesforce/label/c.quantic_InLabel';

/** @typedef {import("coveo").CategoryFacetValue} CategoryFacetValue */

/**
 * The `QuanticCategoryFacetValue` component is used by a `QuanticCategoryFacet` component to display a formatted facet value, path to that value and the number of results with that value.
 * @fires CustomEvent#selectvalue
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-category-facet-value onselectvalue={onSelect} item={result} is-search-result active-parent></c-quantic-category-facet-value>
 */
export default class QuanticCategoryFacetValue extends LightningElement {
  /**
   * The [facet value](https://docs.coveo.com/en/headless/latest/reference/search/controllers/category-facet/#categoryfacetvalue) to display.
   * @api
   * @type {CategoryFacetValue} */
  @api item;
  /**
   * Whether the value is a facet search result.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api isSearchResult = false;
  /**
   * Whether the value is an active parent node.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api activeParent = false;
  /**
   * Whether the value is a non-active parent node.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api nonActiveParent = false;
  /**
   * A function used to set focus to the value.
   * @api
   * @type {VoidFunction}
   */
  @api setFocus() {
    const focusTarget = this.template.querySelector('div [role="button"]');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.focus();
    }
  }

  labels = {
    inLabel,
  };

  get categoryFacetLiClass() {
    return this.activeParent ? 'slds-var-m-left_large slds-grid' : 'slds-grid';
  }

  get facetValue() {
    return this.item.value;
  }

  get ariaLabelValue() {
    return `Inclusion filter on ${this.facetValue}`;
  }

  get isPressed() {
    // convert type boolean to type string for attribute aria-pressed
    return this.item?.state === 'selected' ? 'true' : 'false';
  }

  get pathLabel() {
    // @ts-ignore
    return `${this.labels.inLabel} ${this.item.localizedPath}`;
  }

  /**
   * @param {Event} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(
      new CustomEvent('selectvalue', {
        detail: {
          value: this.facetValue,
        },
      })
    );
  }

  /**
   * @param {KeyboardEvent} evt
   */
  onKeyDown(evt) {
    if (evt.code === 'Enter' || evt.code === 'Space') {
      evt.preventDefault();
      this.dispatchEvent(
        new CustomEvent('selectvalue', {
          detail: {
            value: this.facetValue,
          },
        })
      );
    }
  }
}
