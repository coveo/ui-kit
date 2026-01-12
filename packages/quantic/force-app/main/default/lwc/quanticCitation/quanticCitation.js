import {LinkUtils, generateTextFragmentUrl} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").InteractiveCitation} InteractiveCitation */

const minimumTooltipDisplayDurationMs = 1000;
const tooltipDelayMsShow = 200;
const tooltipDelayMsHide = 100;
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
  /**
   * Whether the citation is in an active state.
   * A citation in an active state is displayed with a blue title and border.
   * @api
   * @type {boolean}
   * @default false
   */
  @api isActive = false;
  /**
   * The name of the Salesforce icon to display before the citation title.
   * @api
   * @example 'utility:attach'
   * @type {string}
   */
  @api iconName;

  /** @type {Object} */
  timeout;
  /** @type {number} */
  hoverStartTimestamp;
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
  /** @type {boolean} */
  isCitationHovered = false;
  /** @type {boolean} */
  isTooltipHovered = false;
  /** @type {Object} */
  showTimer = null;
  /** @type {Object} */
  hideTimer = null;

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
    this.cancelShow();
    this.cancelHide();
  }

  handleCitationMouseEnter() {
    this.isCitationHovered = true;
    this.updateTooltipHideShow();
  }

  handleCitationMouseLeave() {
    this.isCitationHovered = false;
    this.updateTooltipHideShow();
  }

  handleTooltipMouseEnter() {
    this.isTooltipHovered = true;
    this.updateTooltipHideShow();
  }

  handleTooltipMouseLeave() {
    this.isTooltipHovered = false;
    this.updateTooltipHideShow();
  }

  isHovering() {
    return this.isCitationHovered || this.isTooltipHovered;
  }

  updateTooltipHideShow() {
    if (this.isHovering()) {
      this.cancelHide();
      this.scheduleShow();
    } else {
      this.cancelShow();
      this.scheduleHide();
    }
  }

  scheduleShow() {
    if (this.showTimer !== null) return;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      if (this.isHovering()) this.showTooltip();
    }, tooltipDelayMsShow);
  }

  scheduleHide() {
    if (this.hideTimer !== null) return;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (!this.isHovering()) this.hideTooltip();
    }, tooltipDelayMsHide);
  }

  cancelShow() {
    if (this.showTimer === null) return;
    clearTimeout(this.showTimer);
    this.showTimer = null;
  }

  cancelHide() {
    if (this.hideTimer === null) return;
    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }

  showTooltip() {
    if (!this.tooltipIsDisplayed) {
      this.hoverStartTimestamp = Date.now();
      this.tooltipIsDisplayed = true;
      this.tooltipComponent?.showTooltip();
    }
  }

  hideTooltip() {
    if (this.tooltipIsDisplayed) {
      this.dispatchCitationHoverEvent();
      this.tooltipIsDisplayed = false;
      this.tooltipComponent?.hideTooltip();
    }
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

  get citationTitleClasses() {
    return `citation__title slds-m-left_x-small slds-truncate slds-has-flexi-truncate ${this.isActive ? 'citation__title--active' : ''}`;
  }

  get citationLinkClasses() {
    return `citation__link slds-badge slds-badge_lightest slds-align_absolute-center slds-text-link_reset slds-p-left_xx-small slds-p-right_x-small ${this.isActive ? 'citation__link--active' : ''}`;
  }

  get citationIconClasses() {
    return `citation__icon slds-m-left_x-small ${this.isActive ? 'citation__icon--active' : ''}`;
  }
}
