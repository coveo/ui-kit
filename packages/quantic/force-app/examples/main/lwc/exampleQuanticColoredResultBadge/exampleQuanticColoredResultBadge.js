import {LightningElement, track} from 'lwc';

export default class ExampleQuanticColoredResultBadge extends LightningElement {
  // `config` stores the options retrieved from the configurator.
  @track config = {}
  isConfigured = false;

  pageTitle = 'Quantic Colored Result Badge';
  pageDescription = 'The Quantic Colored Result Badge renders a colored result badge.';

  // `options` is used by `configurator` to render the configuration form.
  options = [
    {
      attribute: 'label',
      label: 'Label',
      description: 'The name to display in the colored result badge.',
      defaultValue: ''
    },
    {
      attribute: 'color',
      label: 'Hexadecimal Color',
      description: 'The background color of the result badge.',
      defaultValue: ''
    },
  ];

  testResult = {
    raw: {
      source: 'Test source',
    },
  };

  testField = 'source'

  testType = 'string'

  handleTryItNow(evt) {
    this.config = evt.detail;

    // Setting this to `true` makes the `preview` slot visible,
    // which also loads the Quantic component with the configured options.
    this.isConfigured = true;
  }
}
