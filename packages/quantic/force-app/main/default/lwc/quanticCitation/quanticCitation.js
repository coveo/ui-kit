import {LightningElement, api} from 'lwc';

/**
 * The `QuanticCitation` component renders an individual citation.
 * @fires CustomEvent#click
 * @fires CustomEvent#hover
 * @category Internal
 * @example
 * <c-quantic-citation id={id} title={title} index={index} text={text} click-uri={clickUri} onclick={handleClick} onhover={handleHover}></c-quantic-citation>
 */
export default class QuanticCitation extends LightningElement {
  /**
   * @api
   * @type {string}
   * The id of the citation.
   */
  @api id;
  @api title;
  @api index;
  @api text;
  @api clickUri;

  timeout;
  shouldShowTooltipAfterDelay = false;
  hoverStartTimestamp;
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
    }, 200);
  }

  handleMouseLeave() {
    clearTimeout(this.timeout);
    if (this.tooltipIsDisplayed) {
      this.dispatchEvent(
        new CustomEvent('hover', {
          detail: {citationHoverTimeMs: Date.now() - this.hoverStartTimestamp},
          bubbles: true,
        })
      );
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
}
