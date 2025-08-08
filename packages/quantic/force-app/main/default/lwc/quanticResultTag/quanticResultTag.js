import featured from '@salesforce/label/c.quantic_Featured';
import recommended from '@salesforce/label/c.quantic_Recommended';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultTag` component displays a tag to be used in result templates.
 * @category Result Template
 * @example
 * <c-quantic-result-tag variant="recommended"></c-quantic-result-tag>
 */
export default class QuanticResultTag extends LightningElement {
  /**
   * The tag variant.
   * @api
   * @type {'featured'|'recommended'}
   */
  @api variant;
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html).
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
    },
  };

  /** @type {string} */
  error;

  connectedCallback() {
    let hasError = false;
    if (!this.variant) {
      console.error(
        `The ${this.template.host.localName} requires the variant attribute to be set.`
      );
      hasError = true;
    }
    if (!this.result) {
      console.error(
        `The ${this.template.host.localName} requires the result attribute to be set.`
      );
      hasError = true;
    }
    if (hasError) {
      this.error = `${this.template.host.localName} Error`;
    }
  }

  renderedCallback() {
    this.setTagClass();
  }

  setTagClass() {
    this.template.querySelector('.result-tag')?.classList.add(this.tagClass);
  }

  get label() {
    return this.variants[this.variant].label;
  }

  get icon() {
    return this.variants[this.variant].icon;
  }

  get tagClass() {
    return `${this.variant}-tag`;
  }

  get shouldDisplayBadge() {
    return !this.error && this.variants[this.variant].condition(this.result);
  }
}
