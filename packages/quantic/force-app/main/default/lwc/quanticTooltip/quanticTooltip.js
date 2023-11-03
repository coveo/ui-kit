import {LightningElement, api} from 'lwc';

/**
 * The `QuanticTooltip` displays a tooltip containing a small amount of text that can be displayed when hovering over certain elements.
 * This component should be used inside a container with a CSS position attribute set to the value `relative`
 * @category Internal
 * @example
 * <c-quantic-tooltip light-theme>
 *  <div slot="content">Tooltip content</div>
 * </c-quantic-tooltip>
 */
export default class QuanticTooltip extends LightningElement {
  /**
   * @api
   * @type {string}
   * @deprecated
   * Text value to be shown in the tooltip.
   */
  @api value;
  /**
   * Whether to apply the light theme styles on the tooltip.
   * @api
   * @type {boolean}
   */
  @api lightTheme = false;
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

  /** @type {boolean} */
  isVisible = false;

  get tooltipCSSClass() {
    return `slds-popover ${
      this.lightTheme ? 'tooltip__content--light' : 'slds-popover_tooltip'
    } slds-nubbin_bottom-left slds-is-absolute tooltip__content slds-fall-into-ground ${
      this.isVisible ? 'tooltip__content--visible' : ''
    }`;
  }

  get tooltipIsNotEmpty() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="content"]');
    return !!slot?.assignedNodes()?.length;
  }
}
