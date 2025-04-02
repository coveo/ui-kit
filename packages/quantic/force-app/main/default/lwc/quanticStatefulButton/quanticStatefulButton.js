import {LightningElement, api} from 'lwc';

/**
 * The `QuanticStatefulButton` displays a stateful button with an icon and a tooltip.
 * @category Internal
 * @example
 * <c-quantic-stateful-button value={value}></c-quantic-stateful-button>
 */
export default class QuanticStatefulButton extends LightningElement {
  /**
   * The label of the button.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The icon name of the icon displayed in the button.
   * @api
   * @type {string}
   */
  @api iconName;
  /**
   * The tooltip of the button.
   * @api
   * @type {string}
   */
  @api tooltip;
  /**
   * Indicates whether the button is selected.
   * @api
   * @type {boolean}
   */
  @api selected = false;
  /**
   * The color of stateful button in a selected state.
   * @api
   * @type {string}
   */
  @api selectedStateColor;
  /**
   * Indicates whether to make the stateful button without borders.
   * @api
   * @type {boolean}
   */
  @api withoutBorders = false;
  /**
   * The size of the icon.
   * @api
   * @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'}
   */
  @api
  get iconSize() {
    return this._iconSize;
  }
  set iconSize(value) {
    if (['xx-small', 'x-small', 'small', 'medium', 'large'].includes(value)) {
      this._iconSize = value;
    }
  }

  /** @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'} */
  _iconSize = 'xx-small';

  connectedCallback() {
    this.updateCSSVariables();
  }

  handleClick(event) {
    event.stopPropagation();
    if (this.selected) {
      this.dispatchEvent(new CustomEvent('quantic__deselect'));
    } else {
      this.dispatchEvent(new CustomEvent('quantic__select'));
    }
  }

  handleMouseEnter() {
    this.tooltipComponent.showTooltip();
  }

  handleMouseLeave() {
    this.tooltipComponent.hideTooltip();
  }

  /**
   * Sets the value of the CSS variable "--selected-state-color" to the value of the selectedStateColor property.
   */
  updateCSSVariables() {
    if (this.selectedStateColor) {
      const styles = this.template.host?.style;
      styles.setProperty('--selected-state-color', this.selectedStateColor);
    }
  }

  get buttonCSSClass() {
    return `slds-button slds-grid stateful-button slds-var-p-horizontal_x-small ${
      this.withoutBorders ? 'stateful-button--without-borders' : ''
    } ${
      this.selected
        ? 'slds-button_outline-brand stateful-button--selected'
        : 'slds-button_neutral stateful-button--unselected'
    }`;
  }

  get iconCSSClass() {
    return `${this.selected ? 'stateful-button__icon--selected' : ''}`;
  }

  /**
   * @returns {Object}
   */
  get tooltipComponent() {
    return this.template.querySelector('c-quantic-tooltip');
  }
}
