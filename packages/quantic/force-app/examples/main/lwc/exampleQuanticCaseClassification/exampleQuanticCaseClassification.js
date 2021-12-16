import {LightningElement, track, api} from 'lwc';

export default class ExampleQuanticCaseClassification extends LightningElement {
  @api engineId = 'case-assist-engine';
  @api caseAssistId = 'a4fb453a-b1f1-4054-9067-bef117586baa';

  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Case Classification';
  pageDescription =
    'The QuanticCaseClassification component is a section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category.';

  options = [
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
      defaultValue: 'Which topic relates to your issue?',
    },
    {
      attribute: 'selectPlaceholder',
      label: 'Select placeholder',
      description: 'The placeholder of the select input.',
      defaultValue: 'More Topics',
    },
    {
      attribute: 'messageWhenValueMissing',
      label: 'Message when value missing',
      description: 'The error message to shown when the value is missing.',
      defaultValue: 'select an option',
    },
    {
      attribute: 'options',
      label: 'Options',
      description: 'All the possible values of a given category',
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
      description: 'Tells whether the input is required or not.',
      defaultValue: false,
    },
    {
      attribute: 'maxChoices',
      label: 'Maximum number of choices to be displayed',
      description:
        'The maximum number of choices to be displayed, a choice can be a suggestion, an inline option or the select dropdown.',
      defaultValue: 4,
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
