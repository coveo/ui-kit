import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticGeneratedAnswer extends LightningElement {
  @api engineId = 'quantic-generated-answer-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Generated Answer';
  pageDescription =
    'The QuanticGeneratedAnswer component automatically generates an answer using Coveo machine learning models to answer the query executed by the user.';
  options = [
    {
      attribute: 'fieldsToIncludeInCitations',
      label: 'Fields to include in citations',
      description:
        'A list of fields to fetch with the citations used to generate the answer, separated by commas.',
      defaultValue: 'sfid,sfkbid,sfkavid',
    },
    {
      attribute: 'collapsible',
      label: 'Collapsible',
      description: 'Indicates whether the answer should be collapsible.',
      defaultValue: false,
    },
    {
      attribute: 'withToggle',
      label: 'With Toggle',
      description:
        'Indicates whether the generated answer can be toggle on or off.',
      defaultValue: false,
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
