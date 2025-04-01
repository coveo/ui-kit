import checkForMore from '@salesforce/label/c.quantic_CheckForMore';
import community from '@salesforce/label/c.quantic_Community';
import contactCoveoSupportTeam from '@salesforce/label/c.quantic_ContactCoveoSupportTeam';
import coveoOnlineHelpLink from '@salesforce/label/c.quantic_CoveoOnlineHelpLink';
import goBack from '@salesforce/label/c.quantic_GoBack';
import moreInformation from '@salesforce/label/c.quantic_MoreInformation';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {copyToClipboard} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';
import {errorMap, genericError} from './errorLabels.js';

/** @typedef {import("coveo").QueryError} QueryError */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticQueryError` component handles fatal errors when performing a query on the index or Search API.
 * When the error is known, it displays a link to relevant documentation for debugging purposes.
 * When the error is unknown, it displays a small text area with the JSON content of the error.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-query-error engine-id={engineId}></c-quantic-query-error>
 */
export default class QuanticQueryError extends LightningElement {
  static delegatesFocus = true;

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {string} */
  @track type;
  /** @type {Boolean} */
  @track hasError;
  /** @type {string} */
  @track error;

  /** @type {QueryError} */
  queryError;
  /** @type {Function} */
  unsubscribe;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  errorAriaMessage;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;

  showMoreInfo = false;

  labels = {
    coveoOnlineHelpLink,
    moreInformation,
    checkForMore,
    community,
    contactCoveoSupportTeam,
    goBack,
  };

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
    this.headless = getHeadlessBundle(this.engineId);
    this.queryError = this.headless.buildQueryError(engine);
    this.errorAriaMessage = AriaLiveRegion('queryerror', this);
    this.unsubscribe = this.queryError.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.type = this.queryError.state.error?.type;
    this.hasError = this.queryError.state.hasError;
    if (this.hasError) {
      this.updateAriaLive();
    }
    this.error = this.queryError.state.error
      ? JSON.stringify(this.queryError.state.error, null, 2)
      : '';
  }

  updateAriaLive() {
    this.errorAriaMessage.dispatchMessage(this.errorTitle);
  }

  get errorTitle() {
    return errorMap[this.type]?.title || genericError.title;
  }

  get description() {
    return errorMap[this.type]?.description || genericError.description;
  }

  get link() {
    return errorMap[this.type]?.link;
  }

  handleShowMoreInfoClick() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  async handleCopyToClipboard() {
    const text = this.template.querySelector('code').textContent;

    copyToClipboard(text)
      .then(() => {
        // The copy to clipboard fallback method makes the component lose focus, the logic below resets the focus on the button.
        this.template.host.focus();
      })
      .catch((err) => {
        console.error('Copy to clipboard failed.', text, err);
      });
  }

  get checkForMoreLabel() {
    return I18nUtils.format(
      this.labels.checkForMore,
      I18nUtils.getTextWithDecorator(
        this.labels.community,
        '<a href="https://connect.coveo.com/s/">',
        '</a>'
      ),
      I18nUtils.getTextWithDecorator(
        this.labels.contactCoveoSupportTeam,
        '<a href="https://connect.coveo.com/s/article/5382">',
        '</a>'
      )
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
