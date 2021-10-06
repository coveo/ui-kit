import {LightningElement, api} from "lwc";
import {parseXML} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultPrintableUri` component displays the URI, or path, to access a result.
 * @example
 * <c-quantic-result-printable-uri engine-id={engineId} result={result} result-templates-manager={resultTemplatesManager}></c-quantic-result-printable-uri>
 */
export default class QuanticResultPrintableUri extends LightningElement {
  /**
   * The result item.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The maximum number of Uri parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   * @api
   * @type {string}
   */
  @api maxNumberOfParts = 5;

  /** @type {number} */
  MIN_MAX_NUMBER_OF_PARTS = 3;
  /** @type {boolean} */
  isExpanded = false;

  renderedCallback() {
    if (this.maxNumberOfParts < this.MIN_MAX_NUMBER_OF_PARTS) {
      console.error(`The provided value of ${this.maxNumberOfParts} for the maxNumberOfParts option is inadequate. The provided value must be at least ${this.MIN_MAX_NUMBER_OF_PARTS}.`);
    }
  }

  get allParents() {
    const parentsXml = parseXML(`${this.result.raw.parents}`);
    const parents = Array.from(parentsXml.getElementsByTagName('parent'));
    return parents.map((parent) => ({
      name: parent.getAttribute('name'),
      uri: parent.getAttribute('uri'),
      isFolded: false
    }));
  }

  get foldedParents() {
    if (this.allParents.length <= this.maxNumberOfParts || this.isExpanded) {
      return this.allParents;
    }
    return [...this.allParents.slice(0, 2), { name: '...', isFolded: true }, this.allParents.slice(-1)[0]];
  }

  expandParents() {
    this.isExpanded = true;
  }
}