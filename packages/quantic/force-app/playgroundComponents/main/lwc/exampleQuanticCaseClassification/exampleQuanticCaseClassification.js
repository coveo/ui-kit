// @ts-ignore
import {getCaseAssistId} from 'c/caseAssistUtils';
import {LightningElement, track} from 'lwc';

export default class ExampleQuanticCaseClassification extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Case Classification';
  pageDescription =
    'The QuanticCaseClassification component is a section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category.';

  options = [
    {
      attribute: 'engineId',
      label: 'Engine id',
      description: 'The ID of the engine instance the component registers to.',
      defaultValue: 'case-assist-engine',
    },
    {
      attribute: 'sfFieldApiName',
      label: 'Salesforce API field name',
      description:
        'The name of the field of the case in the Salesforce API to be classified.',
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
      attribute: 'maxSuggestions',
      label: 'Maximum suggestions',
      description: 'The maximum number of suggestions to be displayed',
      defaultValue: 3,
    },
    {
      attribute: 'fetchClassificationOnChange',
      label: 'Fetch classifications on field value change',
      description:
        'Whether the QuanticCaseClassification component should automatically fetch new case classifications when its field values changes',
      defaultValue: false,
    },
    {
      attribute: 'fetchDocumentSuggestionOnChange',
      label: 'Fetch document suggestion on field value change',
      description:
        'Whether the QuanticCaseClassification component should automatically fetch new document suggestions when its field values changes',
      defaultValue: false,
    },
    {
      attribute: 'fetchOnInit',
      label: 'Fetch on init',
      description:
        'Whether or not the component should fetch classifications during initialization.',
      defaultValue: false,
    },
  ];

  async handleTryItNow(evt) {
    this.caseAssistId = await getCaseAssistId('Demo');
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
