import {LightningElement, api} from 'lwc';

import min from "@salesforce/label/c.quantic_Min";
import max from "@salesforce/label/c.quantic_Max";
import numberInputMinimum from "@salesforce/label/c.quantic_NumberInputMinimum";
import numberInputMaximum from "@salesforce/label/c.quantic_NumberInputMaximum";
import apply from "@salesforce/label/c.quantic_Apply";
import numberInputApply from "@salesforce/label/c.quantic_NumberInputApply";

import {I18nUtils} from 'c/quanticUtils';


export default class QuanticNumberInput extends LightningElement {
  /**@type {number} */
  @api start;
  /**@type {number} */
  @api end;
  /** @type {string} */
  @api label;

  minSafeInteger = Number.MIN_SAFE_INTEGER;
  maxSafeInteger = Number.MAX_SAFE_INTEGER;

  labels = {
    min,
    max,
    numberInputMinimum,
    numberInputMaximum,
    apply,
    numberInputApply
  }

  setValidityParameters() {
    this.inputMin.max = this.maxValue || this.maxSafeInteger;
    this.inputMax.min = this.minValue || this.minSafeInteger;
    this.inputMin.required = true;
    this.inputMax.required = true;
  }

  resetValidityParameters() {
    this.inputMin.max = this.maxSafeInteger;
    this.inputMax.min = this.minSafeInteger;
    this.inputMin.required = false;
    this.inputMax.required = false;
  }

  /**
  * @param {InputEvent} evt
  */
  onApply(evt) {
    evt.preventDefault();

    this.setValidityParameters();

    const allValid = [...this.template.querySelectorAll('lightning-input')]
      .reduce((validSoFar, inputCmp) => {
        return validSoFar && inputCmp.reportValidity();
      }, true);
      
    this.resetValidityParameters();

    if (!allValid) {
      return;
    }

    this.dispatchEvent(new CustomEvent(
      'apply',
      {
        detail: {
          min: Number(this.minValue),
          max: Number(this.maxValue)
        }
      })
    );
  }

  /** @returns {HTMLInputElement} */
  get inputMin() {
    return this.template.querySelector('.numeric__input-min');
  }

  /** @returns {HTMLInputElement} */
  get inputMax() {
    return this.template.querySelector('.numeric__input-max');
  }

  get minValue() {
    return this.inputMin?.value;
  }

  get maxValue() {
    return this.inputMax?.value;
  }

  get numberInputMinimumLabel() {
    return I18nUtils.format(this.labels.numberInputMinimum, this.label);
  }

  get numberInputMaximumLabel() {
    return I18nUtils.format(this.labels.numberInputMaximum, this.label);
  }

  get numberInputApplyLabel() {
    return I18nUtils.format(this.labels.numberInputApply, this.label);
  }
}