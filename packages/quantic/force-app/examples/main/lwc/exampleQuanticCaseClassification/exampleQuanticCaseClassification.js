import {LightningElement, track} from 'lwc';

export default class ExampleQuanticCaseClassification extends LightningElement {
  // `config` stores the options retrieved from the configurator.
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Case Classification';
  pageDescription =
    'The QuanticCaseClassification component is a section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category.';

  // `options` is used by `configurator` to render the configuration form.
  options = [
    {
      attribute: 'engineId',
      label: 'Engine id',
      description: 'The engine to be used',
      defaultValue: 'case-assist-engine',
    },
    {
      attribute: 'fieldName',
      label: 'Field name',
      description: 'The field to be classifed',
      defaultValue: 'sfpriority',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label of the component.',
      defaultValue: 'Which topic is related to your problem?',
    },
    {
      attribute: 'selectTitle',
      label: 'Select title',
      description: 'The title of the select input.',
      defaultValue: 'More Topics',
    },
    {
      attribute: 'selectPlaceholder',
      label: 'Select placeholder',
      description: 'The plceholder of the select input.',
      defaultValue: 'Select option',
    },
    {
      attribute: 'messageWhenValueMissing',
      label: 'Message when value missing',
      description: 'The error message to show when the value is missing.',
      defaultValue: 'select an option',
    },

    {
      attribute: 'options',
      label: 'Options',
      description: 'The options to choose from.',
      defaultValue: [
        {label: 'Very low', value: 'Very low'},
        {label: 'Low', value: 'Low'},
        {label: 'Medium', value: 'Medium'},
        {label: 'High', value: 'High'},
        {label: 'Very high', value: 'Very high'},
      ],
    },
    {
      attribute: 'required',
      label: 'Required',
      description: 'Tells if the input is required.',
      defaultValue: false,
    },
    {
      attribute: 'maxChoices',
      label: 'Maximum number of choices',
      description:
        'The maximum number of choices to be shown, a choice can be a suggestions or the select dropdown.',
      defaultValue: 4,
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;

    // Setting this to `true` makes the `preview` slot visible,
    // which also loads the Quantic component with the configured options.
    this.isConfigured = true;
  }
}
