import { LightningElement, api } from 'lwc';

export default class DescriptionStrengthIndicator extends LightningElement {
    @api helpLabel = "Don’t know what to write?";
    progression = 0;

    get variant() {
        return this.progression < 100 ? "warning" : "base-autocomplete";
    }

    get message() {
        return this.progression === 0 ? "Provide details" : this.progression < 100 ? "Provide more details " : "Thank you!";
    }

    @api isFull() {
        return this.progression >= 100;
    }

    @api progress() {
        if (this.progression < 100) {
            this.progression += 25;
        }
    }
}