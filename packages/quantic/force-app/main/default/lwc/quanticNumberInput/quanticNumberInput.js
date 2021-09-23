import { LightningElement, api } from 'lwc';

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

    /** @type {HTMLInputElement} */
    inputMin;
    /** @type {HTMLInputElement} */
    inputMax;

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

    renderedCallback() {
        this.inputMin = this.template.querySelector('.numeric__input-min');
        this.inputMax = this.template.querySelector('.numeric__input-max');
    }
    /**
    * @param {InputEvent} evt
    */
    onApply(evt) {
        evt.preventDefault();
        if(!this.inputMin.validity.valid || !this.inputMax.validity.valid) {
            return;
        }
        this.dispatchEvent(new CustomEvent('apply', { detail : { min: this.inputMin?.valueAsNumber, max: this.inputMax?.valueAsNumber }}));
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