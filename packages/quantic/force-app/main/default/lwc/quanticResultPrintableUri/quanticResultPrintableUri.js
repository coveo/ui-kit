import {LightningElement, api} from "lwc";
import {parseXML} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultPrintableUri` component displays the URI, or path, to access a result.
 * @category Result Template
 * @example
 * <c-quantic-result-printable-uri result={result} max-number-of-parts="3"></c-quantic-result-printable-uri>
 */
export default class QuanticResultPrintableUri extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result).
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The maximum number of URI parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   * @api
   * @type {number}
   * @defaultValue `5`
   */
  @api maxNumberOfParts = 5;
  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).
   * The following keywords have special meanings for where to load the URL:
   *   - `_self`: the current browsing context. (Default)
   *   - `_blank`: usually a new tab, but users can configure their browsers to open a new window instead.
   *   - `_parent`: the parent of the current browsing context. If there’s no parent, this behaves as `_self`.
   *   - `_top`: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`.
   * @api
   * @type {string}
   * @defaultValue `'_self'`
   */
  @api target = '_self';

  /** @type {number} */
  MIN_MAX_NUMBER_OF_PARTS = 3;
  /** @type {boolean} */
  isExpanded = false;
  /** @type {string} */
  error;

  renderedCallback() {
    if (this.maxNumberOfParts < this.MIN_MAX_NUMBER_OF_PARTS) {
      console.error(`The provided value of ${this.maxNumberOfParts} for the maxNumberOfParts option is inadequate. The provided value must be at least ${this.MIN_MAX_NUMBER_OF_PARTS}.`);
      this.error = `${this.template.host.localName} Error`;
    }
  }

  get allParents() {
    const parentsXml = parseXML(`${this.result.raw.parents}`);
    const parents = Array.from(parentsXml.getElementsByTagName('parent'));
    return parents.map((parent, index) => ({
      id: index,
      name: parent.getAttribute('name'),
      uri: parent.getAttribute('uri'),
      isFolded: false,
      classes: index === parents.length - 1 ? 'slds-truncate' : ''
    }));
  }

  get foldedParents() {
    if (this.allParents.length <= this.maxNumberOfParts || this.isExpanded) {
      return this.allParents;
    }
    return [
      ...this.allParents.slice(0, 2),
      { id: 'separator', name: '...', isFolded: true },
      this.allParents.slice(-1)[0]
    ];
  }

  expandParents() {
    this.isExpanded = true;
  }
}