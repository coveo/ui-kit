import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import templateGeneratedAnswerWithFacets from './templates/templateGeneratedAnswerWithFacets.html';
// @ts-ignore
import templateGeneratedAnswerWithoutFacets from './templates/templateGeneratedAnswerWithoutFacets.html';

export default class ExampleQuanticGeneratedAnswer extends LightningElement {
  @api engineId = 'quantic-generated-answer-engine';
  @track config = {};
  isConfigured = false;

  withFacets = false;

  connectedCallback() {
    this.addEventListener('addFacets', this.handleAddFacets);
  }

  disconnectedCallback() {
    this.removeEventListener('addFacets', this.handleAddFacets);
  }

  handleAddFacets = () => {
    this.withFacets = true;
  };

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
      attribute: 'maxCollapsedHeight',
      label: 'Max Collapsed Height',
      description:
        'The maximum height of the answer when it is collapsed, in pixels.',
      defaultValue: 250,
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
    {
      attribute: 'answerConfigurationId',
      label: 'Answer Configuration Id',
      description:
        'The unique identifier of the answer configuration to use to generate the answer.',
      defaultValue: '',
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  render() {
    if (this.withFacets) {
      return templateGeneratedAnswerWithFacets;
    }
    return templateGeneratedAnswerWithoutFacets;
  }
}
