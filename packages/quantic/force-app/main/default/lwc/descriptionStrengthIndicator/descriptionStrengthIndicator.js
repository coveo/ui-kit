import { LightningElement, api } from 'lwc';

export default class DescriptionStrengthIndicator extends LightningElement {
    @api helpLabel = "Don’t know what to write?";
    _progression = 0;

    get variant() {
        return this._progression < 100 ? "warning" : "base-autocomplete";
    }

    get message() {
        return this._progression === 0 ? "Provide details" : this._progression < 100 ? "Provide more details " : "Thank you!";
    }

    @api isFull() {
        return this._progression >= 100;
    }

    @api
    set progression(progression) {
        this._progression = progression;
    }

    get progression() {
        return this._progression;
    }

    @api
    progress() {
        this._progression = (this._progression < 100) ? this._progression + 25 : this._progression;
    }
}