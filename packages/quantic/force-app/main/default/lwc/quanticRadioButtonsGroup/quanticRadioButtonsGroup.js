import {LightningElement, api, track} from 'lwc';

/**
 * The `QuanticRadioButtonsGroupOption` type defines the shape of an option
 * that can be passed to the `QuanticRadioButtonsGroup` component.
 * @typedef {Object} QuanticRadioButtonsGroupOption
 * @property {String} label The label of the option.
 * @property {String} value The value of the option.
 * @property {String} iconName The name of the icon to be displayed.
 * @property {String} tooltip The tooltip of the option.
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

  @track _value;

  /** @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'} */
  _iconSize = 'xx-small';

  get radioButtonElements() {
    return this.template.querySelectorAll('input');
  }

  get transformedOptions() {
    const {options, value} = this;
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        label: option.label,
        value: option.value,
        iconName: option.iconName,
        iconVariant: value === option.value ? 'inverse' : '',
        isChecked: value === option.value,
        buttonCSSClass: this.makeRadioButtonCSSClass(option),
        iconCSSClass: this.makeIconCSSClass(option),
        indexId: `radio-${index}`,
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
    let paddingClass = '';
    if (this.hideLabels && option.iconName) {
      paddingClass = 'slds-var-p-horizontal_x-small';
    } else if (option.iconName) {
      paddingClass = 'slds-var-p-left_medium';
    }
    return `slds-button slds-radio_button ${paddingClass} radio-button radio-button--${option.value === this.value ? 'selected' : 'unselected'}`;
  }

  handleFocus() {
    this.dispatchEvent(new CustomEvent('focus'));
  }

  handleBlur() {
    this.dispatchEvent(new CustomEvent('blur'));
  }

  handleChange(event) {
    event.stopPropagation();

    const value = event.target.value;
    this._value = value;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value,
        },

        composed: true,
        bubbles: true,
        cancelable: true,
      })
    );
  }
}
