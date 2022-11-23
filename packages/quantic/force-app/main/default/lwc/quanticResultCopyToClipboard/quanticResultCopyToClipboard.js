/* eslint-disable @lwc/lwc/no-async-operation */
import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {copyToClipboard, buildTemplateTextFromResult} from 'c/quanticUtils';

export default class QuanticResultCopyToClipboard extends LightningElement {
  @api engineId;
  @api result;
  @api label;
  @api successLabel;
  @api textTemplate = '${title}\n${clickUri}';

  actions;
  displayedLabel;
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
      ...this.headless.loadInsightSearchAnalyticsActions(engine),
    };
  };

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
    setTimeout(() => {
      this.displayedLabel = this.label;
    }, 500);
  }
}
