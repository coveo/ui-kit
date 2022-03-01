import {LightningElement, api} from "lwc";

import recommended from '@salesforce/label/c.quantic_Recommended';
import featured from '@salesforce/label/c.quantic_Featured';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultBadge` component displays a badge to be used in result templates.
 * @category Result Template
 * @example
 * <c-quantic-result-badge variant="recommended"></c-quantic-result-badge>
 */
export default class QuanticResultBadge extends LightningElement {
  /**
   * The badge variant.
   * @api
   * @type {'featured'|'recommended'}
   */
  @api variant;
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result).
   * @api
   * @type {Result}
   */
  @api result;

  variants = {
    recommended: {
      label: recommended,
      icon: 'utility:favorite',
      condition: (result) => result.isRecommendation,
    },
    featured: {
      label: featured,
      icon: 'utility:pinned',
      condition: (result) => result.isTopResult,
    }
  };

  error;

  connectedCallback() {
    let hasError = false;
    if (!this.variant) {
      console.error(`The ${this.template.host.localName} requires the variant attribute to be set.`);
      hasError = true;
    } 
    if (!this.result) {
      console.error(`The ${this.template.host.localName} requires the result attribute to be set.`);
      hasError = true;
    }
    if (hasError) {
      this.error = `${this.template.host.localName} Error`;
    }
  }

  renderedCallback() {
    this.setBadgeClass()
  }

  setBadgeClass() {
    this.template.querySelector('.result-badge')?.classList.add(this.badgeClass);
  }
  
  get label() {
    return this.variants[this.variant].label;
  }

  get icon() {
    return this.variants[this.variant].icon;
  }

  get badgeClass() {
    return `${this.variant}-badge`;
  }

  get shouldDisplayBadge() {
    return !this.error && this.variants[this.variant].condition(this.result);
  }
}