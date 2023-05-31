import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticPager extends LightningElement {
  @api engineId = 'quantic-pager-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Pager';
  pageDescription =
    'The Quantic Pager allows users to navigate the search results using pages.';
  options = [
    {
      attribute: 'numberOfPages',
      label: 'Number of pages',
      description:
        'The number of pages displayed simultaneously by the pager component.',
      defaultValue: 5,
    },
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
