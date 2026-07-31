import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticLoadMoreResults extends LightningElement {
  @api engineId = 'quantic-load-more-results-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Load More Results';
  pageDescription =
    'The Quantic Load More Results component allows users to load additional results into the current result list without navigating to a new page.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
