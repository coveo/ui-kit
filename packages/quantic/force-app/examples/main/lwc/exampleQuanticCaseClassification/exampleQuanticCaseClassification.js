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
      attribute: 'sfFieldApiName',
      label: 'Salesforce API field name',
      description: 'The name of the field of the case in the Salesforce API to be classified.',
      defaultValue: 'Priority',
    },
    {
      attribute: 'coveoFieldName',
      label: 'Coveo field name',
      description: 'The name of the Coveo field to be classified.',
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
      description: 'The error message shown when the value is missing.',
      defaultValue: 'Select an option',
    },
    {
      attribute: 'required',
      label: 'Required',
      description: 'Indicates whether the input is required or not.',
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
