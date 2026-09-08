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
      testId: `cfg-${option.attribute}`,
    }));
  }

  formatDefaultValue(value) {
    return ['boolean', 'number', 'string'].includes(typeof value)
      ? value.toString()
      : '';
  }

  connectedCallback() {
    this.options.forEach(this.validateOption);

    this.options.forEach((option) => {
      if (
        typeof option.defaultValue !== 'undefined' &&
        option.defaultValue !== null
      ) {
        this.state[option.attribute] = option.defaultValue;
      }
    });
  }

  handleFieldChange(evt) {
    const optionAttribute = evt.target.dataset.option;
    const value = evt.target.value;

    const option = this.options.find((o) => o.attribute === optionAttribute);

    switch (typeof option.defaultValue) {
      case 'boolean':
        this.state[optionAttribute] = Boolean(value);
        break;
      case 'number':
        this.state[optionAttribute] = Number(value);
        break;
      default:
        // Let's assume the value is a string
        this.state[optionAttribute] = value;
    }
  }

  handleTry() {
    this.configured = true;
    this.dispatchEvent(
      new CustomEvent('tryitnow', {
        detail: {...this.state},
      })
    );
  }

  handleReset() {
    // eslint-disable-next-line no-restricted-globals
    history.pushState('', document.title, window.location.pathname);
    window.location.reload();
  }

  validateOption(option) {
    if (!option) {
      throw new Error('The option is undefined.');
    }
    if (!option.attribute) {
      throw new Error(
        `The attribute is missing for option '${JSON.stringify(option)}'`
      );
    }
  }
}
