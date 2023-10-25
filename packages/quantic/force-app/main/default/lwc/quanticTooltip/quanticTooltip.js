import {LightningElement, api} from 'lwc';

/**
 * The `QuanticTooltip` displays a tooltip containing a small amount of text that can be displayed when hovering over certain elements.
 * @category Internal
 * @example
 * <c-quantic-tooltip value={value}></c-quantic-tooltip>
 */
export default class QuanticTooltip extends LightningElement {
  /**
   * @api
   * @type {string}
   * Text value to be shown in the tooltip.
   */
  @api value;
  /**
   * @api
   * Method tha shows the tooltip.
   */
  @api showTooltip() {
    this.isVisible = true;
  }
  /**
   * @api
   * Method tha hides the tooltip.
   */
  @api hideTooltip() {
    this.isVisible = false;
  }

  isVisible = false;

  get tooltipCSSClass() {
    return `slds-popover slds-popover_tooltip slds-nubbin_bottom-left slds-is-absolute tooltip__content slds-fall-into-ground ${
      this.isVisible ? 'tooltip__content--visible' : ''
    }`;
  }
}
