import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacetManager extends LightningElement {
  @api engineId = 'quantic-summary-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Summary';
  pageDescription =
    'The QuanticSummary component displays information about the current range of results';
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
