import navigateToRecord from '@salesforce/label/c.quantic_NavigateToRecord';
import opensInBrowserTab from '@salesforce/label/c.quantic_OpensInBrowserTab';
import {LinkUtils} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticSmartSnippetSource` component displays the uri and the title of the smart snippet source.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet-source actions={actions}></c-quantic-smart-snippet-source>
 * @internal
 */
export default class QuanticSmartSnippetSource extends NavigationMixin(
  LightningElement
) {
  /**
   * The smart snippet source.
   * @api
   * @type {Result}
   */
  @api source;
  /**
   * The actions that need to be bound to the links of the smart snippet source.
   * @api
   * @type {{select: function, beginDelayedSelect: function, cancelPendingSelect: function  }}
   */
  @api actions;

  labels = {
    navigateToRecord,
    opensInBrowserTab,
  };

  /** @type {boolean} */
  isInitialRender = true;
  /** @type {function} */
  removeUriBindings;
  /** @type {function} */
  removeTitleBindings;
  /** @type {string} */
  salesforceRecordUrl;

  connectedCallback() {
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

  renderedCallback() {
    if (this.isInitialRender) {
      this.isInitialRender = false;
      this.bindAnalyticsToSmartSnippetSource();
    }
  }

  disconnectedCallback() {
    this.removeTitleBindings?.();
    this.removeUriBindings?.();
  }

  bindAnalyticsToSmartSnippetSource() {
    /** @type {HTMLAnchorElement} */
    const snippetSourceUrlElement = this.template.querySelector(
      '.smart-snippet__source-uri'
    );
    /** @type {HTMLAnchorElement} */
    const snippetSourceTitleElement = this.template.querySelector(
      '.smart-snippet__source-title'
    );

    if (snippetSourceUrlElement) {
      this.removeUriBindings = LinkUtils.bindAnalyticsToLink(
        snippetSourceUrlElement,
        this.actions
      );
    }
    if (snippetSourceTitleElement) {
      this.removeTitleBindings = LinkUtils.bindAnalyticsToLink(
        snippetSourceTitleElement,
        this.actions
      );
    }
  }

  /**
   * Returns the smart snippet source title.
   * @returns {string}
   */
  get sourceTitle() {
    return this.source?.title;
  }

  /**
   * Returns the smart snippet source uri.
   * @returns {string}
   */
  get sourceUri() {
    return this.source?.clickUri;
  }

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
    if (this.source?.raw?.sfkbid && this.source?.raw?.sfkavid) {
      return this.source.raw.sfkavid;
    }
    return this.source.raw.sfid;
  }

  /**
   * Checks if the Result type is Salesforce.
   */
  get isSalesforceLink() {
    return !!this.source?.raw?.sfid;
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

  /**
   * Returns the href value for the link.
   */
  get hrefValue() {
    if (this.isSalesforceLink) {
      return this.salesforceRecordUrl;
    }
    return this.sourceUri;
  }
}
