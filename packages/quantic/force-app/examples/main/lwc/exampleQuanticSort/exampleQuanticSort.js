import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticSort extends LightningElement {
  @api engineId = 'quantic-sort-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Sort';
  pageDescription =
    'The QuanticSort component renders a dropdown that the end user can interact with to select the criterion to use when sorting query results.';
  options = [
    {
      attribute: 'isSearch',
      label: 'Is Search Interface',
      description: 'Define if the use Case is search or else',
      defaultValue: true,
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
