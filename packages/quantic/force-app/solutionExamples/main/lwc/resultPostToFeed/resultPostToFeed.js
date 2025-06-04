import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {buildTemplateTextFromResult} from 'c/quanticUtils';
import postToFeed from '@salesforce/label/c.PostToFeed';
import errorWithQuickAction from '@salesforce/label/c.ErrorWithQuickAction';
import actionIsUnavailable from '@salesforce/label/c.ActionIsUnavailable';
import {I18nUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */

/**
 * This component implements a Result Action that allows a user to post a Coveo result
 * into the Salesforce Chatter Feed using a Quick Action.
 * It uses the Headless Insight engine to log analytics and dispatches a custom event
 * that can be caught by Aura wrapper to insert the result using the Salesforce Quick Action API.
 */
export default class ResultPostToFeed extends LightningElement {
  actionName = 'FeedItem.TextPost';
  labels = {
    postToFeed: postToFeed,
    errorInsertingTheResultInChatter: 'error',
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
   * The result to post to the chatter feed.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The label displayed in the tooltip of the result action button.
   * @api
   * @type {string}
   */
  @api label = this.labels.postToFeed;
  /**
   * The template used to generate the text to insert in the body of the chatter post.
   * Use references to result [fields](https://docs.coveo.com/en/2036/index-content/about-fields) to get their value.
   * @api
   * @type {string}
   */
  @api textTemplate =
    '<a href="${clickUri}">${title}</a><br/><br/><quote>${excerpt}</quote>';

  /** @type {string} */
  iconName = 'utility:share_post';
  /** @type {string} */
  eventName = 'insightpanel__posttofeed';
  /** @type {string} */
  insertType = 'cursor';
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
    this.addEventListener(this.eventName, this.handlePostToFeedClick);
  }

  disconnectedCallback() {
    this.removeEventListener(this.eventName, this.handlePostToFeedClick);
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

  postResultToFeed() {
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

    const postToFeedEvent = new CustomEvent('insightpanel_auraposttofeed', {
      detail: {
        targetFields: {
          Body: {
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

    this.dispatchEvent(postToFeedEvent);
  }

  handlePostToFeedClick = (event) => {
    event.stopPropagation();
    this.engine.dispatch(this.actions.logFeedItemTextPost(this.result));
    this.postResultToFeed();
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
