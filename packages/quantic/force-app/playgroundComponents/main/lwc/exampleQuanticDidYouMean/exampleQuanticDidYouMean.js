import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticPager extends LightningElement {
  @api engineId = 'quantic-did-you-mean-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Did You Mean';
  pageDescription =
    'The Quantic Did You Mean component is responsible for handling query corrections.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
    {
      attribute: 'disableQueryAutoCorrection',
      label: 'Disable Query Auto-Correction',
      description:
        'Whether to disable automatically applying corrections for queries that would otherwise return no results.',
      defaultValue: false,
    },
    {
      attribute: 'queryCorrectionMode',
      label: 'Query Correction Mode',
      description:
        'Defines which query correction system to use. Possible values are: legacy, next',
      defaultValue: 'legacy',
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
