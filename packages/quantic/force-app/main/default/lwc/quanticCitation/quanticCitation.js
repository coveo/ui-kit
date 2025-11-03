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
  /** @type {boolean} */
  isHoveringCitation = false;
  /** @type {boolean} */
  isHoveringTooltip = false;
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
    clearTimeout(this.timeout);
  }

  /**
   * Handles mouse enter on the citation link.
   * Shows tooltip after delay if not already visible.
   */
  handleCitationMouseEnter() {
    this.isHoveringCitation = true;
    clearTimeout(this.timeout);
    this.showTooltipIfNeeded();
  }

  /**
   * Handles mouse leave on the citation link.
   * Schedules tooltip hiding with delay to allow moving to tooltip.
   */
  handleCitationMouseLeave() {
    this.isHoveringCitation = false;
    this.hideTooltipIfNeeded();
  }

  /**
   * Handles mouse enter on the tooltip.
   * Cancels any pending hide to keep tooltip visible.
   */
  handleTooltipMouseEnter() {
    this.isHoveringTooltip = true;
    clearTimeout(this.timeout);
  }

  /**
   * Handles mouse leave on the tooltip.
   * Schedules tooltip hiding with delay.
   */
  handleTooltipMouseLeave() {
    this.isHoveringTooltip = false;
    this.hideTooltipIfNeeded();
  }

  /**
   * Shows the tooltip after a delay if not already displayed.
   */
  showTooltipIfNeeded() {
    if (!this.tooltipIsDisplayed) {
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
  }

  /**
   * Hides the tooltip with a delay to allow smooth cursor movement between citation link and tooltip elements.
   */
  hideTooltipIfNeeded() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timeout = setTimeout(() => {
      if (!this.isHoveringCitation && !this.isHoveringTooltip) {
        this.shouldShowTooltipAfterDelay = false;
        if (this.tooltipIsDisplayed) {
          this.dispatchCitationHoverEvent();
        }

        this.tooltipIsDisplayed = false;
        this.tooltipComponent.hideTooltip();
      }
    }, debounceDurationBeforeHoverMs);
  }

  /**
   * Dispatches the citation hover analytics event if minimum display duration was met.
   */
  dispatchCitationHoverEvent() {
    const tooltipDisplayDuration = Date.now() - this.hoverStartTimestamp;
    if (tooltipDisplayDuration >= minimumTooltipDisplayDurationMs) {
      this.dispatchEvent(
        new CustomEvent('quantic__citationhover', {
          detail: {
            citationHoverTimeMs: tooltipDisplayDuration,
          },
          bubbles: true,
        })
      );
    }
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
