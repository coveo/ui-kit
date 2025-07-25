import {getAbsoluteWidth, getAbsoluteHeight} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

const targetWidthToTooltipWidthRatio = 1.2;

/**
 * The `QuanticTooltip` displays a tooltip containing a small amount of text that can be displayed when hovering over certain elements.
 * This component should be used inside a container with a CSS position attribute set to the value `relative`
 * @category Internal
 * @example
 * <c-quantic-tooltip light-theme target={target}>
 *  <div slot="content">Tooltip content</div>
 * </c-quantic-tooltip>
 */
export default class QuanticTooltip extends LightningElement {
  /**
   * Whether to apply the light theme styles on the tooltip.
   * @api
   * @type {boolean}
   */
  @api lightTheme = false;
  /**
   * The element targeted by the tooltip.
   * @api
   * @type {Element}
   */
  @api target;
  /**
   * @api
   * Method that shows the tooltip.
   */
  @api showTooltip() {
    if (this.tooltipIsNotEmpty) {
      this.updateTooltipDisplay();
      this.isVisible = true;
    }
  }
  /**
   * @api
   * Method that hides the tooltip.
   */
  @api hideTooltip() {
    this.resetPosition();
    this.isVisible = false;
  }

  /** @type {boolean} */
  displayTooltipAboveTarget = true;
  /** @type {boolean} */
  isVisible = false;

  updateTooltipDisplay() {
    this.updateTooltipMaxWidth();
    this.updateTooltipVerticalPosition();
    this.updateTooltipHorizontalPosition();
  }

  updateTooltipMaxWidth() {
    const windowWidth = window.innerWidth;
    const targetWidth = getAbsoluteWidth(this.target);

    const adaptedWidth =
      targetWidth > 0
        ? Math.min(windowWidth, targetWidth * targetWidthToTooltipWidthRatio)
        : windowWidth;

    const styles = this.template.host?.style;
    styles.setProperty('--adapted-max-width', `${adaptedWidth}px`);
  }

  updateTooltipVerticalPosition = () => {
    const tooltipHeight = getAbsoluteHeight(this.tooltip);
    const targetHeight = getAbsoluteHeight(this.target);
    const tooltipArrowHeight = 20;

    const minimumYPositionToDisplayTooltipAbove =
      tooltipHeight + targetHeight + tooltipArrowHeight;

    if (this.tooltipYPosition < 0) {
      this.displayTooltipAboveTarget = false;
    } else if (this.tooltipYPosition > minimumYPositionToDisplayTooltipAbove) {
      this.displayTooltipAboveTarget = true;
    }
  };

  resetPosition() {
    const styles = this.template.host?.style;
    styles.setProperty('--adapted-x-translation', `0px`);
  }

  updateTooltipHorizontalPosition() {
    const windowWidth = window.innerWidth;
    const styles = this.template.host?.style;
    const tooltipWidth = getAbsoluteWidth(this.tooltip);

    if (this.tooltipXPosition < 0) {
      styles.setProperty(
        '--adapted-x-translation',
        `${Math.abs(this.tooltipXPosition)}px`
      );
    } else if (this.tooltipXPosition + tooltipWidth > windowWidth) {
      styles.setProperty(
        '--adapted-x-translation',
        `-${tooltipWidth - (windowWidth - this.tooltipXPosition)}px`
      );
    }
  }

  get tooltipYPosition() {
    const rect = this.tooltip.getBoundingClientRect();
    return rect.y || rect.top;
  }

  get tooltipXPosition() {
    const rect = this.tooltip.getBoundingClientRect();
    return rect.x || rect.left;
  }

  get tooltip() {
    return this.template.querySelector('.slds-popover');
  }

  get tooltipCSSClass() {
    return `slds-popover slds-is-absolute slds-fall-into-ground tooltip__content ${
      this.lightTheme ? 'tooltip__content--light' : 'slds-popover_tooltip'
    } ${
      this.displayTooltipAboveTarget
        ? 'tooltip__content--positioned-above'
        : 'tooltip__content--positioned-below'
    } ${this.isVisible ? 'tooltip__content--visible' : ''}`;
  }

  get tooltipIsNotEmpty() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="content"]');
    return !!slot?.assignedNodes()?.length;
  }

  get tooltipArrowCSSClass() {
    return `tooltip__arrow slds-fall-into-ground slds-is-absolute ${
      this.displayTooltipAboveTarget
        ? 'tooltip__arrow--positioned-above slds-nubbin_bottom tooltip__nubbin--bottom'
        : 'tooltip__arrow--positioned-below slds-nubbin_top tooltip__nubbin--top'
    } ${this.lightTheme ? 'tooltip__arrow--light' : 'tooltip__arrow--dark'} ${
      this.isVisible ? 'tooltip__content--visible' : ''
    }`;
  }
}
