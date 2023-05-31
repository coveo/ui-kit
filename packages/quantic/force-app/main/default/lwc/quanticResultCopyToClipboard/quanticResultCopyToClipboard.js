import copied from '@salesforce/label/c.quantic_Copied';
import copy from '@salesforce/label/c.quantic_Copy';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {copyToClipboard, buildTemplateTextFromResult} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").InsightEngine} InsightEngine */

/**
 * The `QuanticResultCopyToClipboard` component allows the end user to copy a result's details to clipboard.
 * @category Insight Panel
 * @example
 * <c-quantic-result-copy-to-clipboard engine-id={engineId} result={result} text-template="${title}\n${clickUri}"></c-quantic-result-copy-to-clipboard>
 */
export default class QuanticResultCopyToClipboard extends LightningElement {
  static delegatesFocus = true;
  labels = {
    copy,
    copied,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result to copy.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The label to be displayed in the tooltip of the button.
   * @api
   * @type {string}
   */
  @api label = this.labels.copy;
  /**
   * The label to be displayed in the tooltip of the button when the action is successful.
   * @api
   * @type {string}
   */
  @api successLabel = this.labels.copied;
  /**
   * The template used to generate the text to copy to clipboard.
   * Use references to result [fields](https://docs.coveo.com/en/2036/index-content/about-fields) to get their value.
   * @api
   * @type {string}
   */
  @api textTemplate = '${title}\n${clickUri}';

  /** @type {object} */
  actions;
  /** @type {string} */
  displayedLabel;
  /** @type {InsightEngine} */
  engine;
  /** @type {boolean} */
  hasInitializationError = false;

  _loading = false;

  connectedCallback() {
    this.displayedLabel = this.label;
    registerComponentForInit(this, this.engineId);
    this.addEventListener(
      'quantic__copytoclipboard',
      this.handleCopyToClipBoard
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      'quantic__copytoclipboard',
      this.handleCopyToClipBoard
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);

    this.actions = {
      ...this.headless.loadInsightAnalyticsActions(engine),
    };
  };

  /**
   * Performs the copy to clipboard action.
   * @param {CustomEvent} event
   */
  handleCopyToClipBoard = (event) => {
    event.stopPropagation();
    this._loading = true;
    const resultText = buildTemplateTextFromResult(
      this.textTemplate,
      this.result
    );

    copyToClipboard(resultText)
      .then(() => {
        this.engine.dispatch(this.actions.logCopyToClipboard(this.result));
        this.displayedLabel = this.successLabel;
        this.resetOriginalLabel();
        // The copy to clipboard fallback method makes the component lose focus, the logic below resets the focus on the button.
        this.template.host.focus();
      })
      .catch((err) => {
        console.error('Copy to clipboard action failed.', err);
      })
      .finally(() => {
        this._loading = false;
      });
  };

  /**
   * Resets the original label after 1000ms.
   */
  resetOriginalLabel() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.displayedLabel = this.label;
    }, 1000);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
