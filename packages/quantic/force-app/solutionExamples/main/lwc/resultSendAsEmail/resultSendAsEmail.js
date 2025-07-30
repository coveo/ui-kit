import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {buildTemplateTextFromResult} from 'c/quanticUtils';
import sendAsEmail from '@salesforce/label/c.SendAsEmail';
import errorWithQuickAction from '@salesforce/label/c.ErrorWithQuickAction';
import actionIsUnavailable from '@salesforce/label/c.ActionIsUnavailable';
import {I18nUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */

export default class ResultSendAsEmail extends LightningElement {
  actionName = 'Case.SendEmail';
  labels = {
    sendAsEmail,
    errorWithQuickAction: I18nUtils.format(
      errorWithQuickAction,
      this.actionName
    ),
    actionIsUnavailable: I18nUtils.format(actionIsUnavailable, this.actionName),
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result to send in the email body.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The label displayed in the tooltip of the result action button.
   * @api
   * @type {string}
   */
  @api label = this.labels.sendAsEmail;
  /**
   * The template used to generate the text to insert in the body of the email.
   * Use references to result [fields](https://docs.coveo.com/en/2036/index-content/about-fields) to get their value.
   * @api
   * @type {string}
   */
  @api textTemplate =
    '<a href="${clickUri}">${title}</a><br/><br/><quote>${excerpt}</quote>';

  iconName = 'utility:email';
  eventName = 'insightpanel__sendasemail';
  insertType = 'replace';

  /** @type {boolean} */
  _isLoading = false;
  /** @type {boolean} */
  _actionHandled = false;
  /** @type {Function} */
  unsubscribe;
  /** @type {CoveoHeadlessInsight} */
  headless;
  /** @type {NodeJS.Timeout} */
  timeout;
  engine;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener(this.eventName, this.handleSendAsEmailClick);
  }

  disconnectedCallback() {
    this.removeEventListener(this.eventName, this.handleSendAsEmailClick);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;

    this.actions = {
      ...this.headless.loadInsightAnalyticsActions(engine),
    };
  };

  sendResultAsEmail() {
    this._isLoading = true;
    this._actionHandled = false;

    let resultPromiseResolve;
    let resultPromiseReject;
    const resultPromise = new Promise((resolve, reject) => {
      resultPromiseResolve = resolve;
      resultPromiseReject = reject;
    });
    resultPromise.catch(this.handleResultPromiseFailure).finally(() => {
      clearTimeout(this.timeout);
      this._actionHandled = true;
      this._isLoading = false;
    });

    // Set a timeout to reject the promise after 2 seconds if no Aura component handles the event.
    // This helps detect when the LWC is used outside of an Aura wrapper, if nothing catches and resolves/rejects the event,
    // we assume the event went unhandled and log an appropriate error.

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timeout = setTimeout(() => {
      if (!this._actionHandled) {
        resultPromiseReject({auraWrapperMissing: true});
      }
    }, 2000);

    const sendAsEmailEvent = new CustomEvent('insightpanel_aurasendasemail', {
      detail: {
        targetFields: {
          HtmlBody: {
            value: buildTemplateTextFromResult(this.textTemplate, this.result),
            insertType: this.insertType,
          },
        },
        actionName: this.actionName,
        resultPromiseResolve,
        resultPromiseReject,
      },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(sendAsEmailEvent);
  }

  handleSendAsEmailClick = (event) => {
    event.stopPropagation();
    this.engine.dispatch(this.actions.logCaseSendEmail(this.result));
    this.sendResultAsEmail();
  };

  handleResultPromiseFailure = (error) => {
    // The Quick Action promise threw an error from Salesforce.
    const {auraWrapperMissing} = error;
    const message = auraWrapperMissing
      ? this.labels.actionIsUnavailable
      : `[${this.actionName}] ${error?.errors?.[0] ?? this.labels.errorWithQuickAction}`;
    console.error(message);
  };
}
