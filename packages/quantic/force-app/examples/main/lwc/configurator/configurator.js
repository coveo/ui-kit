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
            cyId: `cfg-${option.attribute}`,
        }));
    }

    connectedCallback() {
        this.options.forEach(this.validateOption);

        this.options.forEach((option) => {
            if (option.defaultValue) {
                this.state[option.attribute] = option.defaultValue;
            }
        });
    }

    handleFieldChange(evt) {
        const option = evt.target.dataset.option;
        const value = evt.target.value;

        this.state[option] = value;
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