import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {copyToClipboard, buildTemplateTextFromResult} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").InsightEngine} InsightEngine */


export default class QuanticResultCopyToClipboard extends LightningElement {
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
  @api label = 'Copy';
  /**
   * The label to be displayed in the tooltip of the button when the action is successful.
   * @api
   * @type {string}
   */
  @api successLabel = 'Copied!';
  /**
   * The template that will be used for the copy to clipboard.
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
    const {setLoading, result} = event.detail;
    setLoading(true);
    const resultText = buildTemplateTextFromResult(this.textTemplate, result);

    copyToClipboard(resultText)
      .then(() => {
        setLoading(false);
        this.engine.dispatch(
          this.actions.logCopyToClipboard(this.result)
        );
        this.displayedLabel = this.successLabel;
        this.refreshLabel();
      })
      .catch((err) => {
        setLoading(false);
        console.error('Copy to clipboard action failed.', err);
      });
  };

  refreshLabel() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.displayedLabel = this.label;
    }, 500);
  }
}
