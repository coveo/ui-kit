import {LightningElement, api} from 'lwc';

/**
 * The `QuanticRadioButtonsGroupOption` type defines the shape of an option
 * that can be passed to the `QuanticRadioButtonsGroup` component.
 * @typedef {Object} QuanticRadioButtonsGroupOption
 * @property {String} value The value of the option.
 * @property {String} [label] The label of the option.
 * @property {String} [iconName] The name of the icon to be displayed.
 * @property {String} [tooltip] The tooltip of the option.
 */

/**
 * The `QuanticRadioButtonsGroup` component displays a group of radio buttons.
 * @category Internal
 * @example
 * <c-quantic-radio-buttons-group options={options} legend="my legend"></c-quantic-radio-buttons-group>
 */
export default class QuanticRadioButtonsGroup extends LightningElement {
  /**
   * The value of the label for the Radio Buttons Group.
   * @api
   * @type {String}
   */
  @api legend = '';
  /**
   * The list of options to be displayed.
   * @api
   * @type {QuanticRadioButtonsGroupOption[]}
   */
  @api options;
  /**
   * If the labels should be hidden or visible.
   * @api
   * @type {Boolean}
   */
  @api hideLabels;
  /**
   * The value of the selected radio button inside the Radio Buttons Group.
   * @api
   * @type {String}
   */
  @api get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }
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

  /**
   * @type {string}
   */
  _value;

  /** @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'} */
  _iconSize = 'xx-small';

  get radioButtonElements() {
    return this.template.querySelectorAll('input');
  }

  get transformedOptions() {
    const {options, value: selectedValue} = this;
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        label: option.label,
        value: option.value,
        iconName: option.iconName,
        iconVariant: selectedValue === option.value ? 'inverse' : '',
        isChecked: selectedValue === option.value,
        buttonCSSClass: this.makeRadioButtonCSSClass(option),
        iconCSSClass: this.makeIconCSSClass(option),
        indexId: `radio-${index}`,
        tooltip: option.tooltip,
        clickHandler: (event) => {
          event.stopPropagation();
          this.handleClick(option.value);
        },
        mouseEnterHandler: () => {
          const tooltipToShow = this.getTooltipComponentByValue(option.value);
          tooltipToShow.showTooltip();
        },
        mouseLeaveHandler: () => {
          const tooltipToHide = this.getTooltipComponentByValue(option.value);
          tooltipToHide.hideTooltip();
        },
      }));
    }
    return [];
  }

  get computedLabelClass() {
    return `slds-radio_button__label radio-buttons-group__label ${this.hideLabels ? 'slds-assistive-text' : ''}`;
  }

  makeIconCSSClass(option) {
    return `radio-button-icon${option.value === this.value ? '--selected' : ''}`;
  }

  makeRadioButtonCSSClass(option) {
    return `slds-button slds-radio_button radio-buttons-group__tooltip-container radio-button slds-col slds-grid_align-space radio-button--${option.value === this.value ? 'selected' : 'unselected'}`;
  }

  handleClick(value) {
    if (this._value === value) {
      return;
    }
    this._value = value;
    this.dispatchEvent(
      new CustomEvent('quantic__change', {
        detail: {
          value,
        },
        composed: true,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  handleRadioInputClick(event) {
    // Stop further propagation of the event on click on the radio button.
    // There is a separate onClick handler for the parent elements.
    event.stopPropagation();
  }

  handleChange(event) {
    event.stopPropagation();

    const value = event.target.value;
    this._value = value;

    this.dispatchEvent(
      new CustomEvent('quantic__change', {
        detail: {
          value,
        },
        composed: true,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  /**
   * Find the tooltip element based on the option value.
   * @param {String} value The value to find the tooltip for.
   * @returns  {Object}
   */
  getTooltipComponentByValue(value) {
    return this.template.querySelector(
      `c-quantic-tooltip[data-tooltip-key="${value}"]`
    );
  }

  handleOptionMouseEnter(event) {
    event.stopPropagation();
    const tooltipToShow = this.getTooltipComponentByValue(event.detail);
    tooltipToShow.showTooltip();
  }

  handleOptionMouseLeave(event) {
    event.stopPropagation();
    const tooltipToHide = this.getTooltipComponentByValue(event.detail);
    tooltipToHide.hideTooltip();
  }
}
