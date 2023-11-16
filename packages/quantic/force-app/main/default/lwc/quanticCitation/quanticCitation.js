import {LightningElement, api} from 'lwc';

const minimumTooltipDisplayDurationMs = 1000;
const debounceDurationBeforeHoverMs = 200;

/**
 * The `QuanticCitation` component renders an individual citation.
 * @fires CustomEvent#click
 * @fires CustomEvent#citationhover
 * @category Internal
 * @example
 * <c-quantic-citation citation={citation} onclick={handleClick} onhover={handleHover}></c-quantic-citation>
 */
export default class QuanticCitation extends LightningElement {
  /**
   * @api
   * @type {{title: string, index: number, text: string, clickUri: string}}
   * The citation item information.
   */
  @api citation;

  /** @type {Object} */
  timeout;
  /** @type {number} */
  hoverStartTimestamp;
  /** @type {boolean} */
  shouldShowTooltipAfterDelay = false;
  /** @type {boolean} */
  tooltipIsDisplayed = false;

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
          new CustomEvent('citationhover', {
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
}
