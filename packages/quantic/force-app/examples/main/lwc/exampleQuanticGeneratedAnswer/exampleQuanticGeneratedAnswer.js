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
      attribute: 'answerStyle',
      label: 'Answer style',
      description: 'The answer style to apply when the component first loads.',
      defaultValue: 'default',
    },
    {
      attribute: 'fieldsToIncludeInCitations',
      label: 'Fields to include in citations',
      description:
        'A list of fields to fetch with the citations used to generate the answer, separated by commas.',
      defaultValue: 'sfid,sfkbid,sfkavid',
    },
    {
      attribute: 'multilineFooter',
      label: 'Multiline footer',
      description:
        'Indicates whether footer sections should be displayed on multiple lines.',
      defaultValue: false,
    },
    {
      attribute: 'collapsible',
      label: 'Collapsible',
      description: 'Indicates whether the answer should be collapsible.',
      defaultValue: false,
    },
    {
      attribute: 'withRephraseButtons',
      label: 'With Rephrase Buttons',
      description:
        'Indicates whether the rephrase buttons should be available.',
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
