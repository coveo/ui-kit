import {LinkUtils, extractTextToHighlight} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").InteractiveCitation} InteractiveCitation */

const minimumTooltipDisplayDurationMs = 1000;
const debounceDurationBeforeHoverMs = 200;

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
    this.tooltipComponent.hideTooltip();
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

  /**
   * Generates an encoded text fragment URL for the citation.
   * This URL will highlight the text in the citation if it is an HTML file.
   * If the file type is not HTML or if no text is provided, it returns the original URI.
   * @param {string} uri
   * @param {string} text
   * @param {string} fileType
   * @returns {string}
   * @example
   * generateTextFragmentUrl('https://example.com', 'This is a sample text.', 'html');
   * // Returns: 'https://example.com#:~:text=This%20is%20a%20sample%20text.'
   */
  generateTextFragmentUrl(uri, text, fileType) {
    if (this.disableCitationAnchoring || fileType !== 'html' || !text) {
      return uri;
    }

    const highlight = extractTextToHighlight(text);
    const encodedTextFragment = encodeURIComponent(highlight).replace(
      /-/g,
      '%2D'
    );
    return `${uri}#:~:text=${encodedTextFragment}`;
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
    if (this.isSalesforceLink) {
      return this.salesforceRecordUrl;
    }
    return this.textFragmentUrl;
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

  get textFragmentUrl() {
    return this.generateTextFragmentUrl(
      this.citation.clickUri ?? this.citation.uri,
      this.citation.text,
      this.citation.fields?.filetype
    );
  }
}
