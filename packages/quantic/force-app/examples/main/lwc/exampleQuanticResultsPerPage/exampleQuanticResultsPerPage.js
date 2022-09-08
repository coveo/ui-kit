import {api, LightningElement, track} from 'lwc';

export default class ExampleResultsPerPage extends LightningElement {
  @api engineId = 'quantic-results-per-page-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Results Per Page';
  pageDescription =
    'The Quantic Results Per Page component allows users to modify the number of results that are displayed simultaneously in the result list.';
  options = [
    {
      attribute: 'initialChoice',
      label: 'Initial choice',
      description:
        'The number of results selected on the first load. The initial choice must be a value of "choicesDisplayed".',
      defaultValue: 10,
    },
    {
      attribute: 'choicesDisplayed',
      label: 'Choices displayed',
      description:
        'The comma-separated list of choices that are available to users.',
      defaultValue: '10,25,50,100',
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
