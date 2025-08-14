import navigateToRecord from '@salesforce/label/c.quantic_NavigateToRecord';
import opensInBrowserTab from '@salesforce/label/c.quantic_OpensInBrowserTab';
import {
  getHeadlessBundle,
  getHeadlessEnginePromise,
} from 'c/quanticHeadlessLoader';
import {ResultUtils} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api} from 'lwc';

/**
 * Some document types cannot be opened directly in Salesforce, but we need to open their parent record, as is the case for the Case Comment document type.
 */
const documentTypesRequiringParentRecord = ['CaseComment'];

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultLink` component creates a clickable link from a result that points to the original item.
 * If the result is a Salesforce record or a Salesforce Knowledge article it will open the link in a new salesforce console subtab.
 * Otherwise, it will open the link in the browser tab.
 * @category Result Template
 * @example
 * <c-quantic-result-link engine-id={engineId} result={result} target="_blank"></c-quantic-result-link>
 */
export default class QuanticResultLink extends NavigationMixin(
  LightningElement
) {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html).
   * @api
   * @type {Result}
   */
  @api result;
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
  /**
   * A function used to set focus to the link.
   * @api
   * @type {VoidFunction}
   */
  @api setFocus() {
    const focusTarget = this.template.querySelector('a');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.focus();
    }
  }
  /**
   * Indicates the result field to display as the link text.
   * @api
   * @type {string}
   * @defaultValue `'title'`
   */
  @api displayedField = 'title';

  /** @type {SearchEngine} */
  engine;
  /** @type {AnyHeadless} */
  headless;
  /** @type {string} */
  salesforceRecordUrl;

  labels = {
    navigateToRecord,
    opensInBrowserTab,
  };

  connectedCallback() {
    getHeadlessEnginePromise(this.engineId)
      .then((engine) => {
        this.initialize(engine);
      })
      .catch((error) => {
        console.error(error.message);
      });

    if (this.isSalesforceLink) {
      this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes: {
          recordId: this.recordIdAttribute,
          actionName: 'view',
        },
      }).then((url) => {
        this.salesforceRecordUrl = url;
      });
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;
    ResultUtils.bindClickEventsOnResult(
      this.engine,
      // Destructuring transforms the Proxy object created by Salesforce to a normal object so no unexpected behaviour will occur with the Headless library.
      {...this.result, raw: {...this.result.raw}},
      this.template,
      this.headless.buildInteractiveResult
    );
  };

  handleClick(event) {
    if (this.isSalesforceLink) {
      event.preventDefault();
      this.navigateToSalesforceRecord(event);
    }
  }

  navigateToSalesforceRecord(event) {
    event.stopPropagation();
    const targetPageRef = {
      type: 'standard__recordPage',
      attributes: {
        recordId: this.recordIdAttribute,
        actionName: 'view',
      },
    };
    this[NavigationMixin.Navigate](targetPageRef);
  }

  get recordIdAttribute() {
    // Knowledge article uses the knowledge article version id to navigate.
    if (this.result?.raw?.sfkbid && this.result?.raw?.sfkavid) {
      return this.result.raw.sfkavid;
    }
    if (this.shouldOpenParentRecord) {
      return this.result?.raw?.sfparentid;
    }
    return this.result.raw.sfid;
  }

  get shouldOpenParentRecord() {
    return (
      documentTypesRequiringParentRecord.includes(
        this.result?.raw?.documenttype
      ) && this.result?.raw?.sfparentid
    );
  }

  /**
   * Checks if the Result type is Salesforce.
   */
  get isSalesforceLink() {
    return !!this.result?.raw?.sfid;
  }

  /**
   * Returns the result field to display as the link title.
   */
  get fieldToDisplay() {
    return this.result[this.displayedField] ||
      this.result.raw?.[this.displayedField]
      ? this.displayedField
      : 'clickUri';
  }

  /**
   * Returns the target for the link.
   */
  get targetTab() {
    if (this.isSalesforceLink) {
      return '_blank';
    }
    return this.target;
  }

  /**
   * Returns the aria label value for the link.
   */
  get ariaLabelValue() {
    if (this.isSalesforceLink) {
      return this.labels.navigateToRecord;
    }
    return this.labels.opensInBrowserTab;
  }

  get hrefValue() {
    if (this.isSalesforceLink) {
      return this.salesforceRecordUrl;
    }
    return this.result.clickUri;
  }
}
