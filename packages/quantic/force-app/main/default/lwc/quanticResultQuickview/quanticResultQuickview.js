import {LightningElement, api, track} from 'lwc';
import {getHeadlessEnginePromise} from 'c/quanticHeadlessLoader';

import close from '@salesforce/label/c.quantic_Close';
import openPreview from '@salesforce/label/c.quantic_OpenPreview';
import noPreview from '@salesforce/label/c.quantic_NoPreviewAvailable';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").Quickview} Quickview */
/** @typedef {import("coveo").QuickviewState} QuickviewState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultQuickview` component renders a button which the end user can click to open a modal box containing certain information about a result.
 * @fires CustomEvent#haspreview
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
  * @type {number}
  * @defaultValue `undefined`
  */
  @api maximumPreviewSize;

  /**
   * The icon to be shown in the preview button.
   * @api
   * @type {string}
   * @defaultValue `'utility:preview'`
   */
  @api previewButtonIcon = 'utility:preview';

  /**
   * The label to be shown in the preview button.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api previewButtonLabel = undefined;

  /**
   * The variant of the preview button.
   * @api
   * @type {undefined|'brand'|'outline-brand'}
   * @defaultValue `undefined`
   */
  @api previewButtonVariant;

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
    getHeadlessEnginePromise(this.engineId).then((engine) => {
      this.initialize(engine);
    }).catch((error) => {
      console.error(error.message);
    });
  }

  renderedCallback() {
    if (this.contentContainer && this.state?.resultHasPreview) {
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      this.contentContainer.innerHTML = this.state.content;
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    const options = {
      result: this.result,
      maximumPreviewSize: Number(this.maximumPreviewSize),
    }
    this.quickview = CoveoHeadless.buildQuickview(engine, {options});
    this.unsubscribe = this.quickview.subscribe(() => this.updateState());

    this.dispatchHasPreview(this.quickview.state.resultHasPreview);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.quickview?.state;
  }

  openQuickview() {
    this.isQuickviewOpen = true;
    this.quickview.fetchResultContent();
    this.addRecentResult();
  }

  addRecentResult() {
    getHeadlessEnginePromise(this.engineId).then((engine) => {
      const {pushRecentResult} = CoveoHeadless.loadRecentResultsActions(engine);
      engine.dispatch(pushRecentResult(JSON.parse(JSON.stringify(this.result))));
    });
  }

  closeQuickview() {
    this.isQuickviewOpen = false;
  }

  stopPropagation(evt) {
    evt.stopPropagation();
  }

  dispatchHasPreview(hasPreview) {
    this.dispatchEvent(new CustomEvent('haspreview', {
      detail: {
        hasPreview
      },
      bubbles: true,
      composed: true
    }));
  }

  get isLoading() {
    return this.state?.isLoading;
  }

  get hasNoPreview() {
    return !this.state?.resultHasPreview;
  }

  get contentContainer() {
    return this.template.querySelector('.quickview__content-container');
  }

  get backdropClass() {
    return `slds-backdrop ${this.isQuickviewOpen ? 'slds-backdrop_open' : ''}`;
  }

  get buttonLabel() {
    return this.hasNoPreview ? this.labels.noPreview : this.labels.openPreview;
  }

  get buttonClass() {
    return [
      'slds-button',
      this.previewButtonVariant ? `slds-button_${this.previewButtonVariant}` : 'quickview__button-base'
    ].join(' ')
  }

  get buttonIconClass() {
    return [
      'slds-current-color',
      this.previewButtonLabel && 'slds-button__icon_right'
    ].join(' ');
  }

  get hasButtonLabel() {
    return !!this.previewButtonLabel;
  }
}