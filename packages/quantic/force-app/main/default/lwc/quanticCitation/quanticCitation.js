import {LinkUtils, generateTextFragmentUrl} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").InteractiveCitation} InteractiveCitation */

const minimumTooltipDisplayDurationMs = 1000;
const debounceDurationBeforeHoverMs = 200;

const supportedFileTypesForTextFragment = ['html', 'SalesforceItem'];

/**
 * The `QuanticCitation` component renders an individual citation.
 * @fires CustomEvent#quantic__citationhover
 * @category Internal
 * @example
 * <c-quantic-citation citation={citation} interactive-citation={interactiveCitation} onclick={handleClick} onquantic__citationhover={handleHover}></c-quantic-citation>
 */
export default class QuanticCitation extends NavigationMixin(LightningElement) {
  /**
   * The citation item information.
   * @api
   * @type {{title: string, index: number, text: string, uri: string, clickUri: string, fields: object}}
   */
  @api citation;
  /**
   * An interface containing actions for triggering desirable side effects on the citation link.
   * @api
   * @type {InteractiveCitation}
   */
  @api interactiveCitation;
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   * @default false
   */
  @api disableCitationAnchoring = false;

  /** @type {Object} */
  timeout;
  /** @type {number} */
  hoverStartTimestamp;
  /** @type {boolean} */
  shouldShowTooltipAfterDelay = false;
  /** @type {boolean} */
  tooltipIsDisplayed = false;
  /** @type {function} */
  removeBindings;
  /** @type {boolean} */
  isInitialRender = true;
  /** @type {string} */
  salesforceRecordUrl;
  /** @type {boolean} */
  isHrefWithTextFragment = false;

  connectedCallback() {
    const fileType = this.citation?.fields?.filetype;
    this.isHrefWithTextFragment =
      !this.disableCitationAnchoring &&
      supportedFileTypesForTextFragment.includes(fileType) &&
      !!this.text;
    // Listens to register event from citation action slot
    this.template.addEventListener('actionregister', this.handleCitationActionRegister);
}

  renderedCallback() {
    if (this.isInitialRender) {
      this.bindAnalyticsToCitationLink();
      this.isInitialRender = false;

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
  }

  disconnectedCallback() {
    this.removeBindings?.();
    this.template.removeEventListener('actionregister', this.handleCitationActionRegister);
  }

  handleMouseEnter() {
    this.shouldShowTooltipAfterDelay = true;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timeout = setTimeout(() => {
      if (this.shouldShowTooltipAfterDelay) {
        this.hoverStartTimestamp = Date.now();
        this.tooltipIsDisplayed = true;
        this.tooltipComponent.showTooltip();
      }
    }, debounceDurationBeforeHoverMs);
  }

  handleMouseLeave() {
    clearTimeout(this.timeout);
    if (this.tooltipIsDisplayed) {
      const tooltipDisplayDuration = Date.now() - this.hoverStartTimestamp;
      if (tooltipDisplayDuration >= minimumTooltipDisplayDurationMs) {
        this.dispatchEvent(
          new CustomEvent('quantic__citationhover', {
            detail: {
              citationHoverTimeMs: Date.now() - this.hoverStartTimestamp,
            },
            bubbles: true,
          })
        );
      }
    }

    this.tooltipIsDisplayed = false;
    this.shouldShowTooltipAfterDelay = false;
    // this.tooltipComponent.hideTooltip(); // to un-comment later, this is just so we can click the action button.
  }

  /**
   * Binds the citation link to the proper actions.
   * @returns {void}
   */
  bindAnalyticsToCitationLink() {
    this.removeBindings = LinkUtils.bindAnalyticsToLink(
      this.link,
      this.interactiveCitation
    );
  }

  handleClick(event) {
    // Only apply the Salesforce navigation using the mixin for Salesforce documents and when citation anchoring is disabled.
    // Otherwise we rely on the default behavior of the browser with a `hrefValue`.
    if (this.isSalesforceLink && !this.isHrefWithTextFragment) {
      event.preventDefault();
      this.navigateToSalesforceRecord(event);
    }
  }

  handleCitationActionRegister(event) {
    console.log('Handle citation action register event:', event);
    event.stopPropagation();
    // Child component provides a function we can call to give it the citation data
    const register = event?.detail?.register;
    if (typeof register === 'function') {
      register({
        citation: this.citation,
        interactiveCitation: this.interactiveCitation,
      });
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

  /**
   * Checks if the citation source type is Salesforce.
   */
  get isSalesforceLink() {
    return !!this.citation?.fields?.sfid;
  }

  get recordIdAttribute() {
    // Knowledge article uses the knowledge article version id to navigate.
    if (this.citation?.fields?.sfkbid && this.citation?.fields?.sfkavid) {
      return this.citation.fields.sfkavid;
    }
    return this.citation.fields.sfid;
  }

  get hrefValue() {
    return this.isHrefWithTextFragment
      ? generateTextFragmentUrl(this.sourceUri, this.text)
      : this.sourceUri;
  }

  /**
   * @returns {Object}
   */
  get link() {
    return this.template.querySelector('.citation__link');
  }

  /**
   * @returns {Object}
   */
  get tooltipComponent() {
    return this.template.querySelector(`c-quantic-tooltip`);
  }

  get citationTitle() {
    return this.citation?.title;
  }

  get text() {
    return this.citation?.text;
  }

  get clickUri() {
    return this.citation?.clickUri;
  }

  get index() {
    return this.citation?.index;
  }

  get sourceUri() {
    return this.isSalesforceLink
      ? this.salesforceRecordUrl
      : (this.clickUri ?? this.citation?.uri);
  }
}
