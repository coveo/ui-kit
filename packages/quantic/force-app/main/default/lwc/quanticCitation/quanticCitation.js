import {LinkUtils, generateTextFragmentUrl} from 'c/quanticUtils';
import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").InteractiveCitation} InteractiveCitation */

const minimumTooltipDisplayDurationMs = 1000;
const tooltipHideDelayMs = 200;
const supportedFileTypesForTextFragment = ['html', 'SalesforceItem'];

/**
 * Debounce function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * Includes a cancel method to clear any pending timeout.
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The number of milliseconds to delay
 * @returns {Function} The debounced function with cancel method
 */
export function debounce(fn, delay) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    timeout = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

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

  /** @type {Map<string, Object>} */
  @track actionStates = new Map();
  /** @type {Array<Object>} */
  @track actionIndicators = [];

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
  /** @type {Object} */
  hideTooltipDebounced;

  connectedCallback() {
    // Listens to register event from citation action slot
    this.template.addEventListener(
      'actionregister',
      this.handleCitationActionRegister
    );

    const fileType = this.citation?.fields?.filetype;
    this.isHrefWithTextFragment =
      !this.disableCitationAnchoring &&
      supportedFileTypesForTextFragment.includes(fileType) &&
      !!this.text;

    // Initialize the debounced hide tooltip function
    this.hideTooltipDebounced = debounce(() => {
      if (this.tooltipIsDisplayed) {
        this.dispatchCitationHoverEvent();
      }
      this.tooltipIsDisplayed = false;
      this.tooltipComponent?.hideTooltip();
    }, tooltipHideDelayMs);
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
    this.template.removeEventListener(
      'actionregister',
      this.handleCitationActionRegister
    );
    this.removeBindings?.();
    clearTimeout(this.timeout);
    this.hideTooltipDebounced?.cancel();
  }

  handleCitationMouseEnter() {
    this.showTooltip();
  }

  handleCitationMouseLeave() {
    this.hideTooltipDebounced();
  }

  handleTooltipMouseEnter() {
    this.hideTooltipDebounced.cancel();
  }

  handleTooltipMouseLeave() {
    this.hideTooltipDebounced();
  }

  /**
   * Shows the tooltip immediately and cancels any pending hide.
   */
  showTooltip() {
    this.hideTooltipDebounced.cancel();
    if (!this.tooltipIsDisplayed) {
      this.hoverStartTimestamp = Date.now();
      this.tooltipIsDisplayed = true;
      this.tooltipComponent?.showTooltip();
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

  handleCitationActionRegister(event) {
    console.log('Handle citation action register event:', event);
    event.stopPropagation();
    const {
      actionType,
      onStateChange,
      stateClassPrefix = actionType,
    } = event.detail;

    if (onStateChange) {
      const actionInterface = {
        updateState: (newState) => {
          this.actionStates.set(actionType, {
            ...newState,
            classPrefix: stateClassPrefix,
          });
          this.updateIndicators();
          this.requestUpdate();
        },
        getCitationContext: () => ({
          citation: this.citation,
          element: this.template.host,
          interactiveCitation: this.interactiveCitation,
        }),
      };
      onStateChange(actionInterface);
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

  get citationClasses() {
    const baseClasses =
      'citation slds-m-right_xx-small slds-m-vertical_xx-small slds-is-relative';

    const stateClasses = Array.from(this.actionStates.values())
      .filter((state) => state.active && state.classPrefix)
      .map((state) => `is-${state.classPrefix}`)
      .join(' ');

    return stateClasses ? `${baseClasses} ${stateClasses}` : baseClasses;
  }

  /**
   * Updates the list of action indicators based on current action states.
   */
  updateIndicators() {
    this.actionIndicators = Array.from(this.actionStates.entries())
      .filter(([, state]) => state.showIndicator)
      .map(([actionType, state]) => ({
        key: actionType,
        iconName: state.indicatorIcon,
        altText: state.indicatorText,
        classes: `citation__action-indicator citation__${actionType}-indicator slds-m-right_xx-small`,
      }));
  }

  /**
   * Triggers a re-render by updating a tracked property.
   */
  requestUpdate() {
    // Force re-render by updating actionIndicators reference
    this.actionIndicators = [...this.actionIndicators];
  }
}
