import { LightningElement, api, track } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';

import close from '@salesforce/label/c.quantic_Close';
import openPreview from '@salesforce/label/c.quantic_OpenPreview';
import noPreview from '@salesforce/label/c.quantic_NoPreviewAvailable';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").Quickview} Quickview */
/** @typedef {import("coveo").QuickviewState} QuickviewState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultQuickview` component renders a button/link which the end user can click to open a modal box containing certain information about a result.
 * @example
 * <c-quantic-result-quickview engine-id={engineId} result={result} maximum-preview-size="100"></c-quantic-result-quickview>
 */
export default class QuanticResultQuickview extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result to retrieve a quickview for.
   * @api
   * @type {Result}
   */
  @api result;
  /**
  * The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.
  * @api
  * @type {string}
  * @defaultValue `undefined`
  */
  @api maximumPreviewSize;

  /** @type {QuickviewState} */
  @track state;

  /** @type {Quickview} */
  quickview;
  /** @type {boolean} */
  isQuickviewOpen = false;
  /** @type {Function} */
  unsubscribe;

  labels = {
    close,
    openPreview,
    noPreview
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    const options = {
      result: this.result,
      maximumPreviewSize: this.maximumPreviewSize,
    }
    this.quickview = CoveoHeadless.buildQuickview(engine, {options});
    this.unsubscribe = this.quickview.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.quickview?.state;
    if (this.contentContainer && this.state?.resultHasPreview) {
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      this.contentContainer.innerHTML = this.state.content;
    }
  }

  openQuickview() {
    this.isQuickviewOpen = true;
    this.quickview.fetchResultContent();
  }

  closeQuickview() {
    this.isQuickviewOpen = false;
  }

  get hasNoPreview() {
    return !this.state?.resultHasPreview;
  }

  get contentContainer() {
    return this.template.querySelector('.quickview__content-container');
  }

  get backdropClass() {
    return this.isQuickviewOpen ? 'slds-backdrop slds-backdrop_open' : 'slds-backdrop';
  }

  get buttonLabel() {
    return this.hasNoPreview ? this.labels.noPreview : this.labels.openPreview;
  }
}