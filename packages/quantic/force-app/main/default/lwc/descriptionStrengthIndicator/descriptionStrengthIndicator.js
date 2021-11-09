import { LightningElement, api } from 'lwc';

/**
 * The `descriptionStrengthIndicator` component is a dynamic indicator that shows the user if their case description has enough details so far. It also give hints to the user as to what information they show include in the description. 
 * @example
 * <c-description-strength-indicator></c-description-strength-indicator>
 */
export default class DescriptionStrengthIndicator extends LightningElement {
    /**
     * The message to be shown to the user.
     * @api
     * @type {string}
     * @defaultValue 'Don’t know what to write?'
     */
    @api
    helpLabel = "Don’t know what to write?";

    /** @type {number} */
    _progression = 0;

    get variant() {
        return this._progression < 100 ? "warning" : "base-autocomplete";
    }

    get message() {
        return this._progression === 0 ? "Provide details" : this._progression < 100 ? "Provide more details " : "Thank you!";
    }

    /**
     * Tells if the progression indicator is full
     * @api
     * @returns {boolean}
     */
    @api
    isFull() {
        return this._progression >= 100;
    }

    /**
     * Set the progression
     * @api
     * @param {number} progression - the progression to be set.
     * @returns {void}
     */
    @api
    set progression(progression) {
        this._progression = progression <= 100 ? progression : 100;
    }
    /**
     * Returns the progression
     * @api
     * @returns {number}
     */
    get progression() {
        return this._progression;
    }

    /**
     * Increases the progression
     * @returns {void}
     */
    @api
    progress() {
        this._progression = (this._progression <= 75) ? this._progression + 25 : 100;
    }
}