import {api, LightningElement, track} from 'lwc';

export default class Configurator extends LightningElement {
    @api options = [];
    @track state = {};

    configured = false;

    get _options() {
        return this.options.map((option) => ({
            attribute: option.attribute,
            label: option.label ?? option.attribute,
            description: option.description ?? '',
            defaultValue: option.defaultValue,
            defaultValueAsText: this.formatDefaultValue(option.defaultValue),
            cyId: `cfg-${option.attribute}`,
        }));
    }

    formatDefaultValue(value) {
        if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
            return value.toString();
        }

        return '';
    }

    connectedCallback() {
        this.options.forEach(this.validateOption);

        this.options.forEach((option) => {
            if (typeof (option.defaultValue) !== 'undefined') {
                this.state[option.attribute] = option.defaultValue;
            }
        });
    }

    handleFieldChange(evt) {
        const optionAttribute = evt.target.dataset.option;
        const value = evt.target.value;

        const option = this.options.find((o) => o.attribute === optionAttribute);
        if (typeof (option.defaultValue) === 'boolean') {
            this.state[optionAttribute] = Boolean(value);
        } else if (typeof (option.defaultValue) === 'number') {
            this.state[optionAttribute] = Number(value);
        } else {
            // Let's assume the value is a string
            this.state[optionAttribute] = value;
        }
    }

    handleTry() {
        this.configured = true;
        this.dispatchEvent(new CustomEvent('tryitnow', {
            detail: { ...this.state }
        }))
    }

    handleReset() {
        window.location.reload();
    }

    validateOption(option) {
        if (!option) {
            throw new Error('The option is undefined.');
        }
        if (!option.attribute) {
            throw new Error(`The attribute is missing for option '${JSON.stringify(option)}'`);
        }
    }
}