import {LightningElement, api} from "lwc";

import recommended from '@salesforce/label/c.quantic_Recommended';
import featured from '@salesforce/label/c.quantic_Featured';

/**
 * The `QuanticResultBadge` component displays a badge to be used in result templates.
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

  variants = {
    recommended: {
      label: recommended,
      icon: 'utility:favorite'
    },
    featured: {
      label: featured,
      icon: 'utility:pinned'
    }
  };

  error;

  connectedCallback() {
    if (!this.variant) {
      console.error(`The ${this.template.host.localName} requires the variant attribute to be set.`);
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
}