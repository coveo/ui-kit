import {LightningElement, api} from 'lwc';

/**
 * The `QuanticTooltip` displays a tooltip containing a small amount of text that can be displayed when hovering over certain elements.
 * This component should be used inside a container with a CSS position attribute set to the value `relative`
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
    if (this.tooltipIsNotEmpty) {
      this.isVisible = true;
    }
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

  get tooltipIsNotEmpty() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="content"]');
    return !!slot?.assignedNodes()?.length;
  }
}
